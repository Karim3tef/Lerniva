import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request) {
  try {
    const body = await request.text();
    const webhookSecret = process.env.MUX_WEBHOOK_SECRET;

    // Verify signature if secret is configured
    if (webhookSecret) {
      const muxSignature = request.headers.get('mux-signature');
      if (!muxSignature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }
      // Basic timestamp + signature verification
      const [tPart, v1Part] = muxSignature.split(',');
      const timestamp = tPart?.split('=')[1];
      const signature = v1Part?.split('=')[1];

      if (!timestamp || !signature) {
        return NextResponse.json({ error: 'Invalid signature format' }, { status: 401 });
      }

      const payload = `${timestamp}.${body}`;
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      if (expectedSig !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);

    if (event.type === 'video.asset.ready') {
      const assetId = event.data?.id;
      const playbackId = event.data?.playback_ids?.[0]?.id;
      const uploadId = event.data?.upload_id;

      if (assetId && playbackId && uploadId) {
        // Find the lesson that has this upload_id stored as mux_asset_id
        const { error: updateError } = await supabaseAdmin
          .from('lessons')
          .update({
            mux_asset_id: assetId,
            mux_playback_id: playbackId,
          })
          .eq('mux_asset_id', uploadId);

        if (updateError) {
          console.error('Error updating lesson with Mux data:', updateError);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Mux webhook error:', error);
    return NextResponse.json({ received: true });
  }
}
