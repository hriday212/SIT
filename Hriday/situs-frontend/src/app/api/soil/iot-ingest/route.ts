import { NextResponse } from 'next/server';

// Global variable to hold the latest telemetry from the ESP32 (in-memory for demo purposes)
let latestTelemetry: any = null;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("🟢 [IoT Webhook] New Telemetry Data Received from ESP32:", body);

        // Save it to our global memory so the frontend can poll it
        latestTelemetry = body;

        return NextResponse.json({
            success: true,
            message: "Telemetry ingested securely.",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
    }
}

export async function GET() {
    // The Next.js frontend will poll this to auto-fill the form
    return NextResponse.json({
        success: true,
        data: latestTelemetry
    });
}
