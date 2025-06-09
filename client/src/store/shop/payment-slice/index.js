import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  response: null,
  approvalURL: null,  
  paymentDetails: null,
  isLoading: false,
};

export const checkout = createAsyncThunk(
  "/payment/checkout",
  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/shop/payment/checkout"     
    );   
    return response.data;  
  }
);

export const paymentVerification = createAsyncThunk(
  "/payment/paymentVerification",
  async () => {
    const response = await axios.post(
      "http://localhost:5000/api/shop/payment/paymentVerification"
    );    
    return response.data;  
  }
);

const shoppingPaymentSlice = createSlice({
  name: "shoppingPaymentSlice",
  initialState,
  reducers: {
    resetPaymentDetails: (state) => {
    //   state.response = null;
    },
  },
  extraReducers: (builder) => {
    builder      
      .addCase(checkout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.isLoading = false;        
        state.response = action.payload;
      })
      .addCase(checkout.rejected, (state) => {
        state.isLoading = false;
        state.response = null;
      })
      .addCase(paymentVerification.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(paymentVerification.fulfilled, (state, action) => {
        state.isLoading = false;        
        state.paymentDetails = action.payload;
      })
      .addCase(paymentVerification.rejected, (state) => {
        state.isLoading = false;
        state.paymentDetails = null;
      })
  },
});

export const { resetPaymentDetails } = shoppingPaymentSlice.actions;

export default shoppingPaymentSlice.reducer;
