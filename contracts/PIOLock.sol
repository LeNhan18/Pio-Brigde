// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title PIOLock (Pione Zero Chain)
 * @notice Hợp đồng khóa PIO để bridge sang Goerli. Hỗ trợ multisig (3/5),
 *         timelock 24h cho phép người gửi hoàn tiền (rollback) nếu chưa finalize.
 */
contract PIOLock {
    using EnumerableSet for EnumerableSet.AddressSet;

    IERC20 public immutable pioToken;

    uint256 public constant DEST_CHAIN_ID = 5; // Goerli
    uint256 public constant TIMELOCK_SECONDS = 24 hours;

    // Bộ validator multisig
    EnumerableSet.AddressSet private validatorSet;
    uint256 public constant VALIDATOR_THRESHOLD = 3; // 3/5

    struct LockInfo {
        address sender;
        address destination;
        uint256 amount;
        uint256 srcChainId;
        uint256 destChainId;
        uint256 timestamp;
        uint256 timelockUntil;
        bool finalized;
        bool refunded;
        uint256 approvalCount;
    }

    // lockId => LockInfo
    mapping(bytes32 => LockInfo) public locks;
    // lockId => validator => approved?
    mapping(bytes32 => mapping(address => bool)) public approvals;

    event Locked(
        bytes32 indexed lockId,
        address indexed sender,
        address indexed destination,
        uint256 amount,
        uint256 destChainId,
        uint256 timestamp
    );

    event Approved(bytes32 indexed lockId, address indexed validator, uint256 approvals);
    event Finalized(bytes32 indexed lockId);
    event Refunded(bytes32 indexed lockId, address indexed to, uint256 amount);

    constructor(address pioTokenAddress, address[] memory validators) {
        require(pioTokenAddress != address(0), "PIO token required");
        require(validators.length == 5, "need 5 validators");
        pioToken = IERC20(pioTokenAddress);
        for (uint256 i = 0; i < validators.length; i++) {
            require(validators[i] != address(0), "invalid validator");
            bool added = validatorSet.add(validators[i]);
            require(added, "duplicate validator");
        }
    }

    function isValidator(address account) public view returns (bool) {
        return validatorSet.contains(account);
    }

    function getValidators() external view returns (address[] memory) {
        return validatorSet.values();
    }

    /**
     * @notice Khóa PIO để bridge sang Goerli. Người dùng phải approve trước.
     * @param amount Số lượng PIO
     * @param destination Địa chỉ nhận wPIO bên Goerli
     */
    function lock(uint256 amount, address destination) external returns (bytes32 lockId) {
        require(amount > 0, "amount = 0");
        require(destination != address(0), "bad dest");

        // Nhận PIO từ người dùng
        bool ok = pioToken.transferFrom(msg.sender, address(this), amount);
        require(ok, "transfer failed");

        uint256 ts = block.timestamp;
        lockId = keccak256(abi.encodePacked(msg.sender, destination, amount, DEST_CHAIN_ID, ts));
        LockInfo storage info = locks[lockId];
        require(info.timestamp == 0, "exists");

        info.sender = msg.sender;
        info.destination = destination;
        info.amount = amount;
        info.srcChainId = block.chainid;
        info.destChainId = DEST_CHAIN_ID;
        info.timestamp = ts;
        info.timelockUntil = ts + TIMELOCK_SECONDS;

        emit Locked(lockId, msg.sender, destination, amount, DEST_CHAIN_ID, ts);
    }

    /**
     * @notice Validator phê duyệt lock, khi đủ 3/5 sẽ finalize.
     */
    function approveLock(bytes32 lockId) external {
        require(isValidator(msg.sender), "not validator");
        LockInfo storage info = locks[lockId];
        require(info.timestamp != 0, "unknown");
        require(!info.finalized, "finalized");
        require(!approvals[lockId][msg.sender], "approved");

        approvals[lockId][msg.sender] = true;
        info.approvalCount += 1;
        emit Approved(lockId, msg.sender, info.approvalCount);

        if (info.approvalCount >= VALIDATOR_THRESHOLD) {
            info.finalized = true;
            emit Finalized(lockId);
            // Sau khi finalize: relayer sẽ gửi lockId sang chain đích để mint
        }
    }

    /**
     * @notice Sau 24h nếu chưa finalize, người gửi có thể rollback và nhận lại PIO.
     */
    function rollback(bytes32 lockId) external {
        LockInfo storage info = locks[lockId];
        require(info.timestamp != 0, "unknown");
        require(!info.finalized, "finalized");
        require(!info.refunded, "refunded");
        require(msg.sender == info.sender, "not sender");
        require(block.timestamp >= info.timelockUntil, "timelock");

        info.refunded = true;
        bool ok = pioToken.transfer(info.sender, info.amount);
        require(ok, "refund failed");
        emit Refunded(lockId, info.sender, info.amount);
    }
}


