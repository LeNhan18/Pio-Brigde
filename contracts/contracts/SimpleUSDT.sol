// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleUSDT
 * @notice Simple USDT token for testing (6 decimals like real USDT)
 */
contract SimpleUSDT is ERC20, Ownable {
    constructor() ERC20("Tether USD", "USDT") Ownable() {
        // Mint 1,000,000 USDT tokens to deployer (6 decimals)
        _mint(msg.sender, 1000000 * 10**6);
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
