import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  try {
    // Log environment variables (without exposing full API key)
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const fromName = process.env.RESEND_FROM_NAME;
    const newsletterEmail = process.env.RESEND_NEWSLETTER_EMAIL;
    const newsletterName = process.env.RESEND_NEWSLETTER_NAME;
    const replyTo = process.env.RESEND_REPLY_TO;
    
    console.log('🔍 Environment Check:');
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   RESEND_API_KEY:', apiKey ? `${apiKey.substring(0, 10)}...` : '❌ NOT SET');
    console.log('   RESEND_FROM_EMAIL:', fromEmail || '❌ NOT SET');
    console.log('   RESEND_FROM_NAME:', fromName || '❌ NOT SET');
    console.log('   RESEND_NEWSLETTER_EMAIL:', newsletterEmail || '❌ NOT SET');
    console.log('   RESEND_NEWSLETTER_NAME:', newsletterName || '❌ NOT SET');
    console.log('   RESEND_REPLY_TO:', replyTo || '❌ NOT SET');
    
    // Check for missing variables
    const missing = [];
    if (!apiKey) missing.push('RESEND_API_KEY');
    if (!fromEmail) missing.push('RESEND_FROM_EMAIL');
    if (!fromName) missing.push('RESEND_FROM_NAME');
    if (!newsletterEmail) missing.push('RESEND_NEWSLETTER_EMAIL');
    if (!newsletterName) missing.push('RESEND_NEWSLETTER_NAME');
    if (!replyTo) missing.push('RESEND_REPLY_TO');
    
    if (missing.length > 0) {
      console.error('❌ Missing environment variables:', missing);
      return NextResponse.json({ 
        error: 'Missing environment variables',
        missing,
        env: process.env.NODE_ENV,
        message: `Please set these variables in your hosting platform: ${missing.join(', ')}`
      }, { status: 500 });
    }
    
    const resend = new Resend(apiKey);
    
    console.log('📧 Attempting to send test email...');
    console.log('   From:', `${fromName} <${fromEmail}>`);
    console.log('   To: venkatesh@tinyslash.com');
    
    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: 'venkatesh@tinyslash.com',
      subject: '✅ Production Email Test - Success!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Production Email Test</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
            <h1 style="margin: 0;">✅ Production Email Test</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email system is working correctly!</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">Test Results</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Environment:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${process.env.NODE_ENV}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>From Email:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${fromEmail}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>From Name:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${fromName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Newsletter Email:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${newsletterEmail}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Newsletter Name:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${newsletterName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Reply To:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${replyTo}</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Timestamp:</strong></td>
                <td style="padding: 10px;">${new Date().toISOString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 20px; padding: 20px; background: #d4edda; border-radius: 10px; border-left: 4px solid #28a745;">
            <p style="margin: 0; color: #155724;">
              <strong>✅ Success!</strong> All environment variables are configured correctly and emails are being sent from production.
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
            <p>This is an automated test email from AI Startup Impact</p>
            <p>If you received this, your production email system is working correctly!</p>
          </div>
        </body>
        </html>
      `
    });
    
    console.log('✅ Email sent successfully!', result);
    
    return NextResponse.json({ 
      success: true,
      message: 'Email sent successfully! Check your inbox (including spam/updates folder)',
      result: {
        id: result.data?.id,
        from: fromEmail,
        to: 'venkatesh@tinyslash.com'
      },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        fromEmail,
        fromName,
        newsletterEmail,
        newsletterName,
        replyTo,
        apiKeySet: !!apiKey
      }
    });
    
  } catch (error: any) {
    console.error('❌ Test email failed:');
    console.error('   Error message:', error.message);
    console.error('   Error details:', error);
    
    return NextResponse.json({ 
      error: error.message,
      details: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      env: process.env.NODE_ENV,
      suggestion: 'Check server logs for detailed error information'
    }, { status: 500 });
  }
}
