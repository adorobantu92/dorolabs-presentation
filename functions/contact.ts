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

    // Build sales-focused subject line
    let subject: string;
    if (data.selected_package) {
      subject = `New ${data.selected_package.toUpperCase()} Package Lead – DoroLabs`;
    } else if (data.selected_service) {
      const serviceMap: Record<string, string> = {
        seo: 'SEO',
        ai: 'AI Automation',
        reminders: 'Reminders',
        custom: 'Custom Tools',
        general: 'General',
      };
      const serviceName = serviceMap[data.selected_service] || data.selected_service;
      subject = `New Lead (${serviceName}) – DoroLabs`;
    } else if (data.interest || data.service) {
      subject = `New Lead – DoroLabs [${data.interest || data.service}]`;
    } else {
      subject = `New Lead – DoroLabs`;
    }

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
  // Section 1: Package & Service Interest
  const interestSection: string[] = [];
  if (data.selected_package) {
    const pkgDisplay = data.selected_package.toUpperCase();
    interestSection.push(`<tr><td style="padding: 6px 12px; color: #666;">Package</td><td style="padding: 6px 12px; font-weight: 600;">${escapeHtml(pkgDisplay)}</td></tr>`);
  }
  if (data.selected_service) {
    const serviceMap: Record<string, string> = {
      seo: 'SEO & Visibility',
      ai: 'AI Automation',
      reminders: 'Appointment Reminders',
      custom: 'Custom Tools',
      general: 'General Inquiry',
    };
    const serviceName = serviceMap[data.selected_service] || data.selected_service;
    interestSection.push(`<tr><td style="padding: 6px 12px; color: #666;">Service</td><td style="padding: 6px 12px; font-weight: 600;">${escapeHtml(serviceName)}</td></tr>`);
  }
  if (data.interest) {
    interestSection.push(`<tr><td style="padding: 6px 12px; color: #666;">Interest</td><td style="padding: 6px 12px;">${escapeHtml(data.interest)}</td></tr>`);
  }
  if (data.service) {
    interestSection.push(`<tr><td style="padding: 6px 12px; color: #666;">Form Service</td><td style="padding: 6px 12px;">${escapeHtml(data.service)}</td></tr>`);
  }
  if (data.budget) {
    interestSection.push(`<tr><td style="padding: 6px 12px; color: #666;">Budget</td><td style="padding: 6px 12px; font-weight: 600;">${escapeHtml(data.budget)}</td></tr>`);
  }

  // Section 2: Contact Details
  const contactSection: string[] = [];
  contactSection.push(`<tr><td style="padding: 6px 12px; color: #666;">Name</td><td style="padding: 6px 12px;">${escapeHtml(data.name)}</td></tr>`);
  contactSection.push(`<tr><td style="padding: 6px 12px; color: #666;">Email</td><td style="padding: 6px 12px;"><a href="mailto:${escapeHtml(data.email)}" style="color: #283d3d;">${escapeHtml(data.email)}</a></td></tr>`);
  if (data.phone) {
    contactSection.push(`<tr><td style="padding: 6px 12px; color: #666;">Phone</td><td style="padding: 6px 12px;"><a href="tel:${escapeHtml(data.phone)}" style="color: #283d3d;">${escapeHtml(data.phone)}</a></td></tr>`);
  }

  // Section 3: Business Context
  const businessSection: string[] = [];
  if (data.company) {
    businessSection.push(`<tr><td style="padding: 6px 12px; color: #666;">Company</td><td style="padding: 6px 12px;">${escapeHtml(data.company)}</td></tr>`);
  }
  if (data.existing_website) {
    businessSection.push(`<tr><td style="padding: 6px 12px; color: #666;">Has Website</td><td style="padding: 6px 12px;">${escapeHtml(data.existing_website)}</td></tr>`);
  }
  if (data.message) {
    businessSection.push(`<tr><td style="padding: 6px 12px; color: #666; vertical-align: top;">Message</td><td style="padding: 6px 12px;">${escapeHtml(data.message).replace(/\n/g, '<br>')}</td></tr>`);
  }

  // Build HTML sections
  const buildSection = (title: string, rows: string[]): string => {
    if (rows.length === 0) return '';
    return `
    <div style="margin-bottom: 16px;">
      <div style="background: #283d3d; color: white; padding: 8px 12px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${title}</div>
      <table style="width: 100%; border-collapse: collapse; background: #fafafa; border: 1px solid #e0e0e0; border-top: none;">
        ${rows.join('\n        ')}
      </table>
    </div>`;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Lead</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #333; max-width: 500px; margin: 0 auto; padding: 16px; background: #f5f5f5;">
  <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    ${buildSection('Package & Service Interest', interestSection)}
    ${buildSection('Contact Details', contactSection)}
    ${buildSection('Business Context', businessSection)}
    
    <div style="padding: 12px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee;">
      DoroLabs Website Form • Reply to respond
    </div>
  </div>
</body>
</html>
  `.trim();
}

function buildEmailText(data: ContactFormData): string {
  const lines: string[] = [];

  // ========== PACKAGE & SERVICE INTEREST ==========
  lines.push('PACKAGE & SERVICE INTEREST');
  lines.push('─'.repeat(30));
  if (data.selected_package) {
    lines.push(`Package:     ${data.selected_package.toUpperCase()}`);
  }
  if (data.selected_service) {
    const serviceMap: Record<string, string> = {
      seo: 'SEO & Visibility',
      ai: 'AI Automation',
      reminders: 'Appointment Reminders',
      custom: 'Custom Tools',
      general: 'General Inquiry',
    };
    lines.push(`Service:     ${serviceMap[data.selected_service] || data.selected_service}`);
  }
  if (data.interest) lines.push(`Interest:    ${data.interest}`);
  if (data.service) lines.push(`Form Svc:    ${data.service}`);
  if (data.budget) lines.push(`Budget:      ${data.budget}`);
  if (!data.selected_package && !data.selected_service && !data.interest && !data.service && !data.budget) {
    lines.push('(No specific interest indicated)');
  }
  lines.push('');

  // ========== CONTACT DETAILS ==========
  lines.push('CONTACT DETAILS');
  lines.push('─'.repeat(30));
  lines.push(`Name:        ${data.name}`);
  lines.push(`Email:       ${data.email}`);
  if (data.phone) lines.push(`Phone:       ${data.phone}`);
  lines.push('');

  // ========== BUSINESS CONTEXT ==========
  if (data.company || data.existing_website || data.message) {
    lines.push('BUSINESS CONTEXT');
    lines.push('─'.repeat(30));
    if (data.company) lines.push(`Company:     ${data.company}`);
    if (data.existing_website) lines.push(`Has Website: ${data.existing_website}`);
    if (data.message) {
      lines.push('');
      lines.push('Message:');
      lines.push(data.message);
    }
    lines.push('');
  }

  // Footer
  lines.push('─'.repeat(30));
  lines.push('DoroLabs Website Form • Reply to respond');

  return lines.join('\n');
}
