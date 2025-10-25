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
    uint256 public constant TIMELOCK_DURATION = 24 hours; // 24h timelock
    uint256 public constant MAX_MINT_AMOUNT = 1000000 * 10**18; // 1M wPIO max per transaction

    // lockId đã xử lý -> true
    mapping(bytes32 => bool) public processed;
    // approvals
    mapping(bytes32 => mapping(address => bool)) public approvals;
    mapping(bytes32 => uint256) public approvalCount;
    
    // Timelock mechanism
    mapping(bytes32 => uint256) public timelocks;
    mapping(bytes32 => bool) public timelockExecuted;
    
    // Security features
    mapping(address => uint256) public validatorLastApproval;
    uint256 public constant COOLDOWN_PERIOD = 1 hours; // 1h cooldown between approvals

    event MintRequested(bytes32 indexed lockId, address indexed to, uint256 amount);
    event MintApproved(bytes32 indexed lockId, address indexed validator, uint256 approvals);
    event Minted(bytes32 indexed lockId, address indexed to, uint256 amount);
    event TimelockSet(bytes32 indexed lockId, uint256 timestamp);
    event TimelockExecuted(bytes32 indexed lockId);
    event SecurityAlert(bytes32 indexed lockId, string reason);

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
        require(amount <= MAX_MINT_AMOUNT, "amount too large");
        
        // Security: Cooldown period between approvals
        require(
            block.timestamp >= validatorLastApproval[msg.sender] + COOLDOWN_PERIOD,
            "cooldown period"
        );
        
        // Security: Check for suspicious patterns
        _checkSecurityPatterns(lockId, to, amount);

        require(!approvals[lockId][msg.sender], "approved");
        approvals[lockId][msg.sender] = true;
        approvalCount[lockId] += 1;
        validatorLastApproval[msg.sender] = block.timestamp;
        
        emit MintApproved(lockId, msg.sender, approvalCount[lockId]);

        if (approvalCount[lockId] >= VALIDATOR_THRESHOLD) {
            // Set timelock for critical operations
            if (amount > 10000 * 10**18) { // 10K wPIO threshold
                timelocks[lockId] = block.timestamp;
                emit TimelockSet(lockId, block.timestamp);
                return;
            }
            
            processed[lockId] = true;
            _mint(to, amount);
            emit Minted(lockId, to, amount);
        }
    }

    /**
     * @notice Execute timelocked mint after 24h delay
     */
    function executeTimelockedMint(bytes32 lockId, address to, uint256 amount) external {
        require(timelocks[lockId] > 0, "no timelock");
        require(!timelockExecuted[lockId], "already executed");
        require(
            block.timestamp >= timelocks[lockId] + TIMELOCK_DURATION,
            "timelock not expired"
        );
        require(approvalCount[lockId] >= VALIDATOR_THRESHOLD, "insufficient approvals");
        
        timelockExecuted[lockId] = true;
        processed[lockId] = true;
        _mint(to, amount);
        emit Minted(lockId, to, amount);
        emit TimelockExecuted(lockId);
    }
    
    /**
     * @notice Security pattern detection
     */
    function _checkSecurityPatterns(bytes32 lockId, address to, uint256 amount) internal {
        // Check for rapid successive approvals (potential attack)
        uint256 recentApprovals = 0;
        for (uint256 i = 0; i < validatorSet.length(); i++) {
            address validator = validatorSet.at(i);
            if (approvals[lockId][validator] && 
                block.timestamp - validatorLastApproval[validator] < 300) { // 5 minutes
                recentApprovals++;
            }
        }
        
        if (recentApprovals > 2) {
            emit SecurityAlert(lockId, "Rapid successive approvals detected");
        }
        
        // Check for unusual amounts
        if (amount > 50000 * 10**18) { // 50K wPIO
            emit SecurityAlert(lockId, "Unusually large amount");
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


