"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 5000;
app_1.default.listen(PORT, () => {
    console.log(`
🚀 ===================================================
   RecoverAI — AI Revenue Recovery Backend Server
   Listening on http://localhost:${PORT}
   Environment: ${process.env.NODE_ENV || 'development'}
   OpenAI Key: ${process.env.OPENAI_API_KEY ? 'Present' : 'Missing (Using Demo AI)'}
   Razorpay Key: ${process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing (Using Mock Sandbox)'}
=================================================== 🚀
  `);
});
