import type { GearSlotId } from '../types/build'

/** Original silhouette SVGs for gear slots (placeholder when no custom icon). */
export function SlotSilhouette({
  slot,
  className,
}: {
  slot: GearSlotId
  className?: string
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      width="100%"
      height="100%"
      aria-hidden
      focusable="false"
    >
      {iconGlyph(slot)}
    </svg>
  )
}

function iconGlyph(slot: GearSlotId) {
  switch (slot) {
    case 'mainWeapon':
      return (
        <g fill="currentColor">
          <path d="M23.2 6.2h1.6l1.2 18.6h-4L23.2 6.2z" />
          <path d="M18.5 25.2h11v2.4h-11z" />
          <path d="M21.4 27.6h5.2v12.2c0 1.3-1.1 2.2-2.6 2.2s-2.6-.9-2.6-2.2V27.6z" />
          <path d="M16.8 25.8 14 23.6l1.6-1.6 3.4 2.6zm14.4 0 2.8-2.2-1.6-1.6-3.4 2.6z" />
        </g>
      )
    case 'secondary':
      return (
        <g fill="currentColor">
          {/* Orb + highlight cutout */}
          <path
            fillRule="evenodd"
            d="M24 6c6.1 0 11 4.9 11 11s-4.9 11-11 11-11-4.9-11-11 4.9-11 11-11zm-5.5 4.2a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4z"
          />
          {/* Side wings */}
          <path d="M8.8 25.6 17.2 21.6l2.4 5.6-8.4 6z" />
          <path d="M39.2 25.6 30.8 21.6l-2.4 5.6 8.4 6z" />
          {/* Diamond pedestal (ring) */}
          <path
            fillRule="evenodd"
            d="M24 23.6 31.2 30.8 24 38 16.8 30.8 24 23.6zm0 4.4 3.6 2.8L24 33.6l-3.6-2.8L24 28z"
          />
          {/* Base */}
          <rect x="15" y="38.4" width="18" height="3.2" rx="0.6" />
        </g>
      )
    case 'hat':
      return (
        <g fill="currentColor">
          <path d="M12 22c0-7.2 5.2-12.4 12-12.4S36 14.8 36 22v2.4H12V22z" />
          <path d="M10 24.4h28v3.6c0 1.2-.8 2.2-2 2.2H12c-1.2 0-2-1-2-2.2v-3.6z" />
          <path d="M15.2 12.6 18 9.2l2.2 1.6-2.2 3zm17.6 0L30 9.2l-2.2 1.6 2.2 3z" />
        </g>
      )
    case 'outfitTop':
      return (
        <g fill="currentColor">
          <path d="M16.4 12.4 24 9.6l7.6 2.8 4 4.8-5.2 3.2-2.2-1.6v15.6c0 1-.8 1.8-1.8 1.8H21.6c-1 0-1.8-.8-1.8-1.8V18.8l-2.2 1.6-5.2-3.2 4-4.8z" />
        </g>
      )
    case 'outfitBottom':
      return (
        <g fill="currentColor">
          <path d="M17 10h14v8.4l1.4 17.2H25.4L24 24.2l-1.4 11.4H15.6L17 18.4V10z" />
        </g>
      )
    case 'gloves':
      return (
        <g fill="currentColor">
          <path d="M14.2 14.4c1.4-2.8 4-4.4 7-4.4h.8c1.4 0 2.6.6 3.4 1.6l1.4 1.8 1.2-1.2c.8-.8 1.8-1.2 2.8-1.2 2.4 0 4.2 2 4.2 4.4v14.6c0 3.2-2.4 5.8-5.4 5.8h-6.2c-2.2 0-4.2-1.2-5.2-3.2l-3.4-6.4c-.8-1.4-.4-3.2 1-4 .8-.4 1.8-.4 2.4.2l1.2 1.2V18c0-1.4-.4-2.6-1.2-3.6z" />
        </g>
      )
    case 'shoes':
      return (
        <g fill="currentColor">
          <path d="M12.4 20.4h12.8l1.6 2.4H36c1.4 0 2.4 1.4 1.8 2.8l-1.4 3.4c-.4 1-1.4 1.6-2.4 1.6H13.6c-1.6 0-2.8-1.4-2.6-3l1.4-7.2z" />
          <path d="M12.8 30.8h21.6v3.4c0 1.2-1 2.2-2.2 2.2H15c-1.2 0-2.2-1-2.2-2.2v-3.4z" />
        </g>
      )
    case 'shoulder':
      return (
        <g fill="currentColor">
          <path d="M10.4 16.4c3.2-3.6 8-5.6 13.6-5.6s10.4 2 13.6 5.6l1.6 2.2-5.2 2.4c-2.6-2-6-3.2-10-3.2s-7.4 1.2-10 3.2l-5.2-2.4 1.6-2.2z" />
          <path d="M14 22.8c2.6-1.8 5.8-2.8 10-2.8s7.4 1 10 2.8l2.4 12.8H11.6L14 22.8z" />
        </g>
      )
    case 'belt':
      return (
        <g fill="currentColor">
          <path d="M8 21.2h32v6.4H8z" />
          <path d="M19.2 18.8h9.6v11.2c0 1.2-1 2.2-2.2 2.2h-5.2c-1.2 0-2.2-1-2.2-2.2V18.8z" />
          <path d="M21.6 22.4h4.8v4H21.6z" />
        </g>
      )
    case 'cape':
      return (
        <g fill="currentColor">
          <path d="M16.4 10.8h15.2l2.4 4.4-4.4 2.4v4.8l8.8 14.8H28.4L24 24.4l-4.4 12.8H9.6l8.8-14.8v-4.8l-4.4-2.4 2.4-4.4z" />
        </g>
      )
    case 'earrings':
      return (
        <g fill="currentColor">
          <path d="M14.2 10.8c1.6 0 2.8 1.2 2.8 2.8v10.4l-2.8 4.2-2.8-4.2V13.6c0-1.6 1.2-2.8 2.8-2.8zm19.6 0c1.6 0 2.8 1.2 2.8 2.8v10.4l-2.8 4.2-2.8-4.2V13.6c0-1.6 1.2-2.8 2.8-2.8z" />
          <path d="M14.2 29.6 17 34.4l-2.8 2.4-2.8-2.4zm19.6 0 2.8 4.8-2.8 2.4-2.8-2.4z" />
        </g>
      )
    case 'pendant1':
    case 'pendant2':
      return (
        <g fill="currentColor">
          <path d="M12.4 12.8c.4-.4 4.8 3.2 11.6 3.2s11.2-3.6 11.6-3.2c.4.6-3.6 5.2-11.6 5.2S12 13.4 12.4 12.8z" />
          <circle cx="24" cy="18.4" r="1.4" />
          <path d="M24 19.6 20.4 28.8h7.2L24 19.6zm-4.2 10.4h8.4l-1.6 5.6h-5.2z" />
        </g>
      )
    case 'ring1':
    case 'ring2':
    case 'ring3':
    case 'ring4':
      return (
        <g fill="currentColor">
          <path d="M24 12.4c6 0 10.8 4.8 10.8 10.8S30 34 24 34 13.2 29.2 13.2 23.2 18 12.4 24 12.4zm0 4.4c-3.6 0-6.4 2.8-6.4 6.4s2.8 6.4 6.4 6.4 6.4-2.8 6.4-6.4-2.8-6.4-6.4-6.4z" />
          <path d="M21.2 9.6h5.6l1.6 4.4h-8.8z" />
        </g>
      )
    case 'face':
      return (
        <g fill="currentColor">
          <path d="M10.8 24.4c2.4-4.8 6.4-7.2 13.2-7.2s10.8 2.4 13.2 7.2c-2.8 1.6-5.6.8-7.6-1.2-1.6 2.8-4 4.4-5.6 4.4s-4-1.6-5.6-4.4c-2 2-4.8 2.8-7.6 1.2z" />
        </g>
      )
    case 'eye':
      return (
        <g fill="currentColor">
          <path d="M8.8 20.4h12.8v9.6H8.8zm17.6 0H39.2v9.6H26.4z" />
          <path d="M21.6 23.2h4.8v4h-4.8z" />
          <path d="M10.4 22h9.6v6.4H10.4zm17.6 0H37.6v6.4H28z" />
        </g>
      )
    case 'medal':
      return (
        <g fill="currentColor">
          <path d="M24 10.8c6.2 0 11.2 5 11.2 11.2S30.2 33.2 24 33.2 12.8 28.2 12.8 22 17.8 10.8 24 10.8zm0 4.8a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8z" />
          <path d="M18.8 32.4 16 40.4h5.2l2.8-8zm10.4 0 2.8 8H26.8l2.4-8z" />
        </g>
      )
    case 'badge':
      return (
        <g fill="currentColor">
          <path d="M24 8.4 34.8 14v11.2c0 7.2-4.8 12.8-10.8 14.8-6-2-10.8-7.6-10.8-14.8V14L24 8.4zm0 5.2-7.2 3.6v8c0 4.8 3.2 8.8 7.2 10.4 4-1.6 7.2-5.6 7.2-10.4v-8L24 13.6z" />
          <path d="M24 18.4 26.4 23l5 .4-3.8 3.2 1.2 4.8L24 28.8l-4.8 2.6 1.2-4.8-3.8-3.2 5-.4z" />
        </g>
      )
    case 'title':
      return (
        <g fill="currentColor">
          <path d="M12 12h24v24H12zm3.2 3.2v17.6h17.6V15.2H15.2z" />
          <path d="M24 18.4 26.8 23l5.2.4L28 27l1.2 5.2L24 29.6l-5.2 2.6L20 27l-4-3.2 5.2-.4z" />
        </g>
      )
    case 'socket':
      return (
        <g fill="currentColor">
          <circle cx="24" cy="18.4" r="9.2" />
          <path d="M16.4 28.4h15.2l-2.4 5.6H18.8zm1.6 6.4h12l1.6 4.8H16.4z" />
        </g>
      )
    default:
      return <circle cx="24" cy="24" r="10" fill="currentColor" />
  }
}
