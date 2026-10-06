import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      room_image,
      tile_image,
      dst_corners,
      obstacles = [],
      tile_w_px = 140,
      tile_h_px = 280,
      grout_size = 2,
      grout_color = [200, 200, 200]
    } = body;

    if (!room_image || !tile_image || !dst_corners || dst_corners.length !== 4) {
      return NextResponse.json(
        { success: false, error: 'Oda görseli, seramik ve 4 köşe noktası gereklidir.' },
        { status: 400 }
      );
    }

    // Try executing Python OpenCV engine
    const pythonScript = path.join(process.cwd(), 'scripts', 'opencv_tile_engine.py');

    const result = await new Promise((resolve) => {
      const pyProcess = spawn('python', [pythonScript]);

      let stdoutData = '';
      let stderrData = '';

      const timeout = setTimeout(() => {
        pyProcess.kill();
        resolve({ success: false, error: 'OpenCV işlemi zaman aşımına uğradı' });
      }, 8000);

      pyProcess.stdin.write(JSON.stringify({
        room_image,
        tile_image,
        dst_corners,
        obstacles,
        tile_w_px,
        tile_h_px,
        grout_size,
        grout_color
      }));
      pyProcess.stdin.end();

      pyProcess.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString();
      });

      pyProcess.stderr.on('data', (chunk) => {
        stderrData += chunk.toString();
      });

      pyProcess.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0 && stdoutData.trim()) {
          try {
            const parsed = JSON.parse(stdoutData.trim());
            resolve(parsed);
          } catch (e) {
            resolve({ success: false, error: 'OpenCV çıktı ayrıştırma hatası' });
          }
        } else {
          resolve({
            success: false,
            error: stderrData || `OpenCV çıkış kodu: ${code}`,
            fallbackToClient: true
          });
        }
      });

      pyProcess.on('error', (err) => {
        clearTimeout(timeout);
        resolve({
          success: false,
          error: err.message,
          fallbackToClient: true
        });
      });
    });

    if (result.success) {
      return NextResponse.json(result);
    }

    // If Python is unavailable or errored (e.g. Vercel serverless), notify client to use its native client-side Homography engine
    return NextResponse.json({
      success: false,
      fallbackToClient: true,
      message: 'Sunucuda Python/OpenCV bulunamadı, istemci tarafı homografi motoru kullanılıyor.'
    });

  } catch (error) {
    console.error('[OpenCV Tile Route Error]', error);
    return NextResponse.json(
      { success: false, fallbackToClient: true, error: error.message },
      { status: 500 }
    );
  }
}
