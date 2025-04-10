import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const alt = 'Integriverse'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom, #000000, #111827)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: 40,
          background: 'rgba(124, 58, 237, 0.1)',
          borderRadius: '50%',
          width: 240,
          height: 240,
          padding: 20
        }}>
          <div style={{ fontSize: 160, fontWeight: 'bold', color: '#8b5cf6' }}>I</div>
        </div>
        <div style={{ fontWeight: 'bold' }}>Integriverse</div>
        <div style={{ 
          fontSize: 36, 
          marginTop: 20, 
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '80%',
          textAlign: 'center'
        }}>
          Intelligent integration assistant for NetSuite and Celigo
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse width and height.
      ...size,
    }
  )
}