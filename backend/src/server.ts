import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
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
