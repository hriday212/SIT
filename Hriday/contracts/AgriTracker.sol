// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AgriTracker {
    // 1. Land Records
    struct LandRecord {
        address owner;
        string coordinates;
        uint256 areaSqMeters;
        bool isVerified;
    }
    mapping(address => LandRecord) public landRecords;

    // 2. Soil Quality
    struct SoilData {
        uint256 timestamp;
        uint256 n; // Nitrogen
        uint256 p; // Phosphorus
        uint256 k; // Potassium
        uint256 phLevel;
        uint256 temp;
        uint256 moisture;
        string targetCrop;
    }
    mapping(address => SoilData[]) public soilHistory;

    // 3. Payments (DBT)
    struct Payment {
        uint256 timestamp;
        uint256 amount;
        string schemeName;
        address sender;
    }
    mapping(address => Payment[]) public paymentHistory;

    event LandRegistered(address indexed owner, string coordinates, uint256 area);
    event SoilDataLogged(address indexed farmer, uint256 moisture, uint256 phLevel, string targetCrop);
    event PaymentReceived(address indexed farmer, uint256 amount, string scheme);

    // Register Land
    function registerLand(string memory _coordinates, uint256 _area) public {
        landRecords[msg.sender] = LandRecord({
            owner: msg.sender,
            coordinates: _coordinates,
            areaSqMeters: _area,
            isVerified: true
        });
        emit LandRegistered(msg.sender, _coordinates, _area);
    }

    // Record Payment
    function recordPayment(address _farmer, string memory _schemeName) public payable {
        require(msg.value > 0, "Payment amount must be greater than 0");
        paymentHistory[_farmer].push(Payment({
            timestamp: block.timestamp,
            amount: msg.value,
            schemeName: _schemeName,
            sender: msg.sender
        }));
        emit PaymentReceived(_farmer, msg.value, _schemeName);
    }

    // Log Soil Data
    function logSoilData(
        uint256 _n,
        uint256 _p,
        uint256 _k,
        uint256 _phLevel,
        uint256 _temp,
        uint256 _moisture,
        string memory _targetCrop
    ) public {
        soilHistory[msg.sender].push(SoilData({
            timestamp: block.timestamp,
            n: _n,
            p: _p,
            k: _k,
            phLevel: _phLevel,
            temp: _temp,
            moisture: _moisture,
            targetCrop: _targetCrop
        }));
        emit SoilDataLogged(msg.sender, _moisture, _phLevel, _targetCrop);
    }

    // Getters for arrays
    function getSoilHistory(address _farmer) public view returns (SoilData[] memory) {
        return soilHistory[_farmer];
    }

    function getPaymentHistory(address _farmer) public view returns (Payment[] memory) {
        return paymentHistory[_farmer];
    }
}
