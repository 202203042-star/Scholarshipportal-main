import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ScholarshipMonitorLog from "@/models/ScholarshipMonitorLog";

// GET — cleanup: mark all non-"changed" unresolved logs as resolved
export async function GET() {
  try {
    await connectDB();

    // Mark unreachable, ok, error logs as resolved (they should go to history)
    const result = await ScholarshipMonitorLog.updateMany(
      { resolved: false, status: { $in: ["unreachable", "ok", "error"] } },
      { $set: { resolved: true, resolvedAt: new Date() } }
    );

    return NextResponse.json({
      message: `Cleaned up ${result.modifiedCount} non-change logs → moved to history`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
