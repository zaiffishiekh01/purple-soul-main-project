import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: guidelines, error } = await supabase
      .from("product_guidelines")
      .select("*")
      .eq("is_active", true)
      .order("section_order");

    if (error) {
      throw error;
    }

    const formatContent = (content: string) => {
      return content
        .split('\n')
        .map((line) => {
          if (line.startsWith('# ')) {
            return `<h3 style="font-size: 18px; font-weight: bold; color: #1e3a8a; margin-top: 20px; margin-bottom: 10px;">${line.substring(2)}</h3>`;
          } else if (line.startsWith('## ')) {
            return `<h4 style="font-size: 16px; font-weight: 600; color: #2563eb; margin-top: 15px; margin-bottom: 8px;">${line.substring(3)}</h4>`;
          } else if (line.startsWith('- ')) {
            return `<li style="margin-left: 20px; margin-bottom: 5px; color: #374151;">${line.substring(2)}</li>`;
          } else if (line.match(/^\d+\./)) {
            return `<li style="margin-left: 20px; margin-bottom: 5px; color: #374151; list-style-type: decimal;">${line}</li>`;
          } else if (line.startsWith('**') && line.endsWith('**')) {
            return `<p style="font-weight: 600; color: #1f2937; margin-top: 10px; margin-bottom: 5px;">${line.replace(/\*\*/g, '')}</p>`;
          } else if (line.trim() === '') {
            return '<br />';
          } else {
            return `<p style="color: #4b5563; line-height: 1.6; margin-bottom: 8px;">${line}</p>`;
          }
        })
        .join('');
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { 
            size: A4; 
            margin: 25mm 20mm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6; 
            color: #333;
            background: white;
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            margin-bottom: 40px;
            border-radius: 8px;
          }
          .header h1 {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          .section {
            margin-bottom: 35px;
            padding: 25px;
            background: #f9fafb;
            border-left: 4px solid #2563eb;
            border-radius: 6px;
            page-break-inside: avoid;
          }
          .section-number {
            display: inline-block;
            width: 40px;
            height: 40px;
            background: #2563eb;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 40px;
            font-weight: bold;
            font-size: 18px;
            margin-right: 15px;
            vertical-align: middle;
          }
          .section-title {
            font-size: 22px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 20px;
            display: inline-block;
            vertical-align: middle;
          }
          .content {
            margin-top: 15px;
          }
          .footer {
            margin-top: 50px;
            padding: 30px;
            background: #eff6ff;
            border-radius: 8px;
            text-align: center;
          }
          .footer h3 {
            color: #1e3a8a;
            margin-bottom: 15px;
            font-size: 20px;
          }
          .contact-info {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 15px;
          }
          .contact-item {
            text-align: left;
          }
          .contact-label {
            font-weight: 600;
            color: #1f2937;
            display: block;
            margin-bottom: 5px;
          }
          .contact-value {
            color: #2563eb;
            text-decoration: none;
          }
          .brand-footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #dbeafe;
            color: #6b7280;
            font-size: 14px;
          }
          ul, ol {
            margin-left: 0;
            padding-left: 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📚 Product Upload Guidelines</h1>
          <p>Comprehensive Guide for Vendors | Sufi Science Center</p>
        </div>

        ${(guidelines || []).map((guideline: any, index: number) => `
          <div class="section">
            <div>
              <span class="section-number">${index + 1}</span>
              <h2 class="section-title">${guideline.title}</h2>
            </div>
            <div class="content">
              ${formatContent(guideline.content)}
            </div>
          </div>
        `).join('')}

        <div class="footer">
          <h3>📞 Need Help?</h3>
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-label">Bulk Upload Support:</span>
              <a href="mailto:bulk@sufisciencecenter.info" class="contact-value">bulk@sufisciencecenter.info</a>
            </div>
            <div class="contact-item">
              <span class="contact-label">Individual Vendor Queries:</span>
              <a href="mailto:vendorsupport@sufisciencecenter.info" class="contact-value">vendorsupport@sufisciencecenter.info</a>
            </div>
          </div>
          <div class="brand-footer">
            <p><strong>Sufi Science Center</strong> - Sacred Gift Shop</p>
            <p>© ${new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error generating guidelines PDF:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate guidelines PDF" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});