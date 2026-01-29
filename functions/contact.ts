/**
 * DoroLabs Contact Form Handler
 * Cloudflare Pages Function using Resend API
 * 
 * Environment variables required:
 * - RESEND_API_KEY: Your Resend API key
 */

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  existing_website?: string;
  interest?: string;
  service?: string;
  budget?: string;
  message?: string;
  consent?: string;
  selected_package?: string;
  selected_service?: string;
}

interface ResendResponse {
  id?: string;
  message?: string;
}

interface Env {
  RESEND_API_KEY: string;
}

// CORS headers for same-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.dorolabs.eu',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Handle OPTIONS for CORS preflight
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://www.dorolabs.eu',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Handle POST requests
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Validate API key is configured
  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY environment variable is not set');
    return new Response(
      JSON.stringify({ success: false, error: 'Server configuration error' }),
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    // Parse form data
    const formData = await request.formData();
    const data: ContactFormData = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      company: formData.get('company')?.toString() || '',
      existing_website: formData.get('existing_website')?.toString() || '',
      interest: formData.get('interest')?.toString() || '',
      service: formData.get('service')?.toString() || '',
      budget: formData.get('budget')?.toString() || '',
      message: formData.get('message')?.toString() || '',
      consent: formData.get('consent')?.toString() || '',
      selected_package: formData.get('selected_package')?.toString() || '',
      selected_service: formData.get('selected_service')?.toString() || '',
    };

    // Honeypot check (spam prevention)
    const honeypot = formData.get('_gotcha')?.toString();
    if (honeypot) {
      // Bot detected, return fake success
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Validate required fields
    if (!data.name || !data.name.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!data.email || !isValidEmail(data.email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Valid email is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Build email content
    const emailHtml = buildEmailHtml(data);
    const emailText = buildEmailText(data);

    // Determine subject based on interest/service
    const serviceInfo = data.interest || data.service || 'General inquiry';
    const subject = `New contact request – DoroLabs [${serviceInfo}]`;

    // Send email via Resend API
    // Note: Use 'onboarding@resend.dev' for testing until dorolabs.eu is verified
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DoroLabs <onboarding@resend.dev>',
        to: ['dorolabs.ac@gmail.com'],
        subject: subject,
        html: emailHtml,
        text: emailText,
        reply_to: data.email,
      }),
    });

    const resendResult: ResendResponse = await resendResponse.json();
    
    // Log for debugging
    console.log('Resend response status:', resendResponse.status);
    console.log('Resend result:', JSON.stringify(resendResult));

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendResult);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send message' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Success
    return new Response(
      JSON.stringify({ success: true, id: resendResult.id }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function buildEmailHtml(data: ContactFormData): string {
  const rows: string[] = [];

  // Package/Service tracking at top for visibility
  if (data.selected_package) {
    const pkgDisplay = data.selected_package.toUpperCase();
    rows.push(`<tr style="background: #e8f4f8;"><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>🎯 Package:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${escapeHtml(pkgDisplay)}</strong></td></tr>`);
  }
  if (data.selected_service) {
    rows.push(`<tr style="background: #e8f4f8;"><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>🔧 Service Interest:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${escapeHtml(data.selected_service)}</strong></td></tr>`);
  }

  rows.push(`<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.name)}</td></tr>`);
  rows.push(`<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>`);

  if (data.phone) {
    rows.push(`<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></td></tr>`);
  }

  if (data.company) {
    rows.push(`<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Company:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.company)}</td></tr>`);
  }

  if (data.existing_website) {
    rows.push(`<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Has Website:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.existing_website)}</td></tr>`);
  }

  if (data.interest) {
    rows.push(`<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Interest:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.interest)}</td></tr>`);
  }

  if (data.service) {
    rows.push(`<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Service:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.service)}</td></tr>`);
  }

  if (data.budget) {
    rows.push(`<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Budget:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.budget)}</td></tr>`);
  }

  if (data.message) {
    rows.push(`<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Message:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.message).replace(/\n/g, '<br>')}</td></tr>`);
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Request</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #283d3d; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">New Contact Request</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">DoroLabs Website Form Submission</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
    <table style="width: 100%; border-collapse: collapse;">
      ${rows.join('\n      ')}
    </table>
    
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
      <p>This message was sent from the DoroLabs website contact form.</p>
      <p>Reply directly to this email to respond to the sender.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function buildEmailText(data: ContactFormData): string {
  const lines: string[] = [
    'New Contact Request - DoroLabs',
    '================================',
    '',
  ];

  // Package/Service tracking at top
  if (data.selected_package) {
    lines.push(`🎯 PACKAGE: ${data.selected_package.toUpperCase()}`);
  }
  if (data.selected_service) {
    lines.push(`🔧 SERVICE INTEREST: ${data.selected_service}`);
  }
  if (data.selected_package || data.selected_service) {
    lines.push('');
  }

  lines.push(`Name: ${data.name}`);
  lines.push(`Email: ${data.email}`);

  if (data.phone) lines.push(`Phone: ${data.phone}`);
  if (data.company) lines.push(`Company: ${data.company}`);
  if (data.existing_website) lines.push(`Has Website: ${data.existing_website}`);
  if (data.interest) lines.push(`Interest: ${data.interest}`);
  if (data.service) lines.push(`Service: ${data.service}`);
  if (data.budget) lines.push(`Budget: ${data.budget}`);

  if (data.message) {
    lines.push('');
    lines.push('Message:');
    lines.push('--------');
    lines.push(data.message);
  }

  lines.push('');
  lines.push('---');
  lines.push('This message was sent from the DoroLabs website contact form.');

  return lines.join('\n');
}
