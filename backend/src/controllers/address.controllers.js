import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";

import mongoose from "mongoose";
import { Address } from "../models/address.models.js";
import { User } from "../models/user.models.js";

const addAddress = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(404, "User id is not valid");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const {
    countryCode,
    firstName,
    lastName,
    phone,
    address1,
    address2,
    city,
    zone,
    pinCode,
  } = req.body;

  if (
    [
      countryCode,
      firstName,
      lastName,
      phone,
      address1,
      city,
      zone,
      pinCode,
    ].some((feild) => feild.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  address2.trim();

  const savedAddress = await Address.create({
    countryCode,
    firstName,
    lastName,
    phone,
    address1,
    address2,
    city,
    zone,
    pinCode,
    user: user._id,
  });

  if (!savedAddress) {
    throw new ApiError(500, "Error while saving the address");
  }

  return res
    .status(200)
    .send(new ApiResponse(200, savedAddress, "Address saved successfully"));
});

const getAddress = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(404, "Invalid User ID");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Fetch all addresses for the user
  const addresses = await Address.find({ user: userId });

  // If no addresses are found, return an empty array
  if (!addresses || addresses.length === 0) {
    throw new ApiError(404, "No addresses found for this user");
  }

  return res
    .status(200)
    .send(new ApiResponse(200, addresses, "Addresses fetched successfully"));
});
const getSingleAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  // Check if the addressId is valid
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(404, "Invalid Address ID");
  }

  // Find the address by ID
  const address = await Address.findById(addressId).populate("user");

  // If no address is found, throw an error
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // If address is found, return it with success message
  return res
    .status(200)
    .send(new ApiResponse(200, address, "Address fetched successfully"));
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  // Validate addressId
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(404, "Invalid Address ID");
  }

  // Delete address by ID
  const address = await Address.findByIdAndDelete(addressId);

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  return res
    .status(200)
    .send(new ApiResponse(200, null, "Address deleted successfully"));
});

const editSingleAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { userId } = req.body; // if you need to check ownership

  // Validate addressId
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(404, "Invalid Address ID");
  }

  // Find the address to ensure it exists
  const address = await Address.findById(addressId);
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Optional: Ensure the address belongs to the current user
  if (address.user.toString() !== userId) {
    throw new ApiError(403, "You do not have permission to edit this address");
  }

  // Update only the fields that are provided in the request body
  const updatedFields = {};
  if (req.body.countryCode) updatedFields.countryCode = req.body.countryCode;
  if (req.body.firstName) updatedFields.firstName = req.body.firstName;
  if (req.body.lastName) updatedFields.lastName = req.body.lastName;
  if (req.body.phone) updatedFields.phone = req.body.phone;
  if (req.body.address1) updatedFields.address1 = req.body.address1;
  if (req.body.address2) updatedFields.address2 = req.body.address2;
  if (req.body.city) updatedFields.city = req.body.city;
  if (req.body.zone) updatedFields.zone = req.body.zone;
  if (req.body.pinCode) updatedFields.pinCode = req.body.pinCode;

  // Update the address with only the provided fields
  const updatedAddress = await Address.findByIdAndUpdate(
    addressId,
    { $set: updatedFields }, // Only update the fields that were passed
    { new: true, runValidators: true } // Return the updated document
  );

  if (!updatedAddress) {
    throw new ApiError(500, "Error while updating the address");
  }

  return res
    .status(200)
    .send(new ApiResponse(200, updatedAddress, "Address updated successfully"));
});

const checkUserHasAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(404, "user id not found");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const addresses = await Address.find({ user });
  if (!addAddress) {
    throw new ApiError(400, "No address found in database");
  }
  return res
    .status(200)
    .send(new ApiResponse(200, addresses, "addresses fetched successfully"));
});

export {
  addAddress,
  getAddress,
  getSingleAddress,
  editSingleAddress,
  deleteAddress,
  checkUserHasAddress,
};
