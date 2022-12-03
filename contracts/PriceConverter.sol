// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

/**
 * @title A library to get latest price from price feeds
 * @author Carl Edward P.
 * @custom:experimental This is an experimental contract.
 */
library PriceConverter {
    /**
     * @return uint256 the latest price from the price feed
     */
    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        (, int price, , , ) = priceFeed.latestRoundData();
        return uint256(price);
    }

    /**
     * @return uint256 the equivalent USD from ETH value
     */
    function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        // 1e8 since the decimal for Goerli price feed is 8
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e8;
        return ethAmountInUsd;
    }
}
