const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PIO Bridge", function () {
  async function deployAll() {
    const [deployer, v1, v2, v3, v4, v5, user, dest] = await ethers.getSigners();
    const validators = [v1.address, v2.address, v3.address, v4.address, v5.address];

    const Mock = await ethers.getContractFactory("MockPIO");
    const mock = await Mock.deploy("PIO", "PIO");
    await mock.deployed();

    // Mint cho user
    await mock.mint(user.address, ethers.utils.parseEther("100"));

    const Lock = await ethers.getContractFactory("PIOLock");
    const lock = await Lock.deploy(mock.address, validators);
    await lock.deployed();

    const Mint = await ethers.getContractFactory("PIOMint");
    const mint = await Mint.deploy(validators);
    await mint.deployed();

    return { deployer, v1, v2, v3, v4, v5, user, dest, validators, mock, lock, mint };
  }

  it("lock -> finalize -> mint", async function () {
    const ctx = await deployAll();
    const amount = ethers.utils.parseEther("10");

    // user approve + lock
    await ctx.mock.connect(ctx.user).approve(ctx.lock.address, amount);
    const tx = await ctx.lock.connect(ctx.user).lock(amount, ctx.dest.address);
    const receipt = await tx.wait();
    const lockedEvent = receipt.events.find((e) => e.event === "Locked");
    const lockId = lockedEvent.args.lockId;

    // 3 validators approve
    await ctx.lock.connect(ctx.v1).approveLock(lockId);
    await ctx.lock.connect(ctx.v2).approveLock(lockId);
    await ctx.lock.connect(ctx.v3).approveLock(lockId);

    const info = await ctx.lock.locks(lockId);
    expect(info.finalized).to.eq(true);

    // Mint side approvals (simulate relayer providing same lockId and amount)
    await ctx.mint.connect(ctx.v1).approveMint(lockId, ctx.dest.address, amount);
    await ctx.mint.connect(ctx.v2).approveMint(lockId, ctx.dest.address, amount);
    await ctx.mint.connect(ctx.v3).approveMint(lockId, ctx.dest.address, amount);

    const bal = await ctx.mint.balanceOf(ctx.dest.address);
    expect(bal).to.eq(amount);
  });

  it("rollback after 24h if not finalized", async function () {
    const ctx = await deployAll();
    const amount = ethers.utils.parseEther("5");

    await ctx.mock.connect(ctx.user).approve(ctx.lock.address, amount);
    const tx = await ctx.lock.connect(ctx.user).lock(amount, ctx.dest.address);
    const receipt = await tx.wait();
    const lockId = receipt.events.find((e) => e.event === "Locked").args.lockId;

    // Chưa đủ approvals, tăng thời gian 24h
    await time.increase(24 * 60 * 60 + 1);

    // rollback
    const before = await ctx.mock.balanceOf(ctx.user.address);
    await ctx.lock.connect(ctx.user).rollback(lockId);
    const after = await ctx.mock.balanceOf(ctx.user.address);
    expect(after.sub(before)).to.eq(amount);
  });
});


