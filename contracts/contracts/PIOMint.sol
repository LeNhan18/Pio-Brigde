// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PIOMint (Ethereum Goerli)
 * @notice Hợp đồng wPIO với cơ chế multisig (3/5) để mint dựa trên lockId từ chuỗi nguồn.
 */
contract PIOMint is ERC20, Pausable, Ownable, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private validatorSet;
    uint256 public constant VALIDATOR_THRESHOLD = 3; // 3/5

    // lockId đã xử lý -> true
    mapping(bytes32 => bool) public processed;
    // approvals
    mapping(bytes32 => mapping(address => bool)) public approvals;
    mapping(bytes32 => uint256) public approvalCount;

    event MintRequested(bytes32 indexed lockId, address indexed to, uint256 amount);
    event MintApproved(bytes32 indexed lockId, address indexed validator, uint256 approvals);
    event Minted(bytes32 indexed lockId, address indexed to, uint256 amount);

    constructor(address[] memory validators) ERC20("Wrapped PIO", "wPIO") {
        require(validators.length == 5, "need 5 validators");
        _transferOwnership(msg.sender);
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
     * @notice Bắt đầu quy trình mint. Thực tế, relayer sẽ gọi approveMint nhiều validator.
     *         Hàm này chỉ phát event, không yêu cầu gọi bắt buộc.
     */
    function requestMint(bytes32 lockId, address to, uint256 amount) external {
        require(!processed[lockId], "processed");
        require(to != address(0), "bad to");
        require(amount > 0, "amount=0");
        emit MintRequested(lockId, to, amount);
    }

    /**
     * @notice Validator phê duyệt. Khi đủ 3/5 sẽ mint.
     */
    function approveMint(bytes32 lockId, address to, uint256 amount) external whenNotPaused nonReentrant {
        require(isValidator(msg.sender), "not validator");
        require(!processed[lockId], "processed");
        require(to != address(0), "bad to");
        require(amount > 0, "amount=0");

        require(!approvals[lockId][msg.sender], "approved");
        approvals[lockId][msg.sender] = true;
        approvalCount[lockId] += 1;
        emit MintApproved(lockId, msg.sender, approvalCount[lockId]);

        if (approvalCount[lockId] >= VALIDATOR_THRESHOLD) {
            processed[lockId] = true;
            _mint(to, amount);
            emit Minted(lockId, to, amount);
        }
    }

    /**
     * @notice Emergency functions - chỉ owner
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Thêm validator mới - chỉ owner
     */
    function addValidator(address validator) external onlyOwner {
        require(validator != address(0), "invalid validator");
        require(validatorSet.length() < 10, "too many validators");
        bool added = validatorSet.add(validator);
        require(added, "validator exists");
    }

    /**
     * @notice Xóa validator - chỉ owner
     */
    function removeValidator(address validator) external onlyOwner {
        require(validatorSet.length() > 3, "need at least 3 validators");
        bool removed = validatorSet.remove(validator);
        require(removed, "validator not found");
    }

    /**
     * @notice Burn tokens - chỉ owner (để burn khi bridge ngược)
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}


