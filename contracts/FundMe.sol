// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__Unauthorized();
error FundMe__CallFailed();
error FundMe__NotEnoughEther();

/**
 * @title A contract for funding a smart contract
 * @author Carl Edward P.
 * @notice This contract is to demo a sample funding contract
 * @custom:experimental This is an experimental contract.
 */
contract FundMe {
    using PriceConverter for uint256;

    address private immutable i_owner;
    address[] private s_funders;
    mapping(address => uint256) private s_funderToAmountFunded;
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__Unauthorized();
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice This function funds this smart contract
     * @dev Implements the price feeds as library
     */
    function fund() public payable {
        uint256 minimumUSD = 5 * 1e18;

        if (msg.value.getConversionRate(s_priceFeed) < minimumUSD) {
            revert FundMe__NotEnoughEther();
        }
        if (s_funderToAmountFunded[msg.sender] == 0) {
            s_funders.push(msg.sender);
        }
        s_funderToAmountFunded[msg.sender] += msg.value;
    }

    /**
     * @notice This function withdraws all the funds in this contract to the owner.
               It also resets the funder array and mappings
     * @dev Implements the price feeds as library
     */
    function withdraw() public onlyOwner {
        uint256 fundersLength = s_funders.length;

        for (uint256 i = 0; i < fundersLength; ) {
            address funder = s_funders[i];
            s_funderToAmountFunded[funder] = 0;
            unchecked {
                i++;
            }
        }
        s_funders = new address[](0);

        (bool success, ) = payable(i_owner).call{value: address(this).balance}("");
        if (!success) revert FundMe__CallFailed();
    }

    function getCurrentPrice() public view returns (uint256) {
        return PriceConverter.getPrice(s_priceFeed);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAmountFunded(address funder) public view returns (uint256) {
        return s_funderToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
