import { NextResponse } from 'next/server';
import { db, ref, get } from '@/lib/firebase';

export const maxDuration = 60;

const CLIENT_ID = "210065801527-qo2vl3cqamubuai4vnn3oldv0rsnm4a3.apps.googleusercontent.com";
const CLIENT_SECRET = "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";

function extractFileId(url) {
    if (!url) return null;
    const m = url.match(/(?:drive\.google\.com\/file\/d\/|docs\.google\.com\/(?:presentation|document|spreadsheets|forms)\/d\/)([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
}

async function getAccessToken() {
    let refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
    if (!refreshToken) {
        const configSnap = await get(ref(db, 'adminSettings/driveConfig'));
        if (configSnap.exists()) refreshToken = configSnap.val().refreshToken;
    }
    if (!refreshToken) return null;

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token;
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const fileUrl = searchParams.get('url');
        if (!fileUrl) {
            return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
        }

        const fileId = extractFileId(fileUrl);
        if (!fileId) {
            return NextResponse.json({ error: 'Not a Google file' }, { status: 400 });
        }

        const accessToken = await getAccessToken();
        if (!accessToken) {
            return NextResponse.json({ error: 'Drive not configured' }, { status: 500 });
        }

        const metaRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType,name`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!metaRes.ok) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        const meta = await metaRes.json();

        const isGoogleNative = meta.mimeType && meta.mimeType.startsWith('application/vnd.google-apps.');
        if (isGoogleNative) {
            const previewUrl = fileUrl.replace(/\/(edit|view).*$/, '/preview');
            return NextResponse.redirect(previewUrl);
        }

        const fileRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!fileRes.ok) {
            return NextResponse.json({ error: 'Download failed' }, { status: 500 });
        }

        const buffer = await fileRes.arrayBuffer();
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': meta.mimeType || 'application/octet-stream',
                'Cache-Control': 'public, max-age=3600',
            },
        });

    } catch (error) {
        console.error('File proxy error:', error);
        return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
    }
}
