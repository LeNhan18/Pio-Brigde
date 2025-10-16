// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimplePIO
 * @notice Simple PIO token for testing
 */
contract SimplePIO is ERC20, Ownable {
    constructor() ERC20("PIO Token", "PIO") Ownable() {
        // Mint 1,000,000 PIO tokens to deployer
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
