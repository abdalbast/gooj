

## Plan: Add Gift Box Personalisation Feature

Add a personalisation section to the **Product Detail page** where users can upload a photo and write a personal message before adding a gift box to their bag. The personalisation data will also display in checkout.

### Changes

**1. New component: `src/components/product/GiftPersonalisation.tsx`**
- Collapsible/expandable section titled "Personalise Your Gift Box"
- **Photo upload**: file input accepting images (jpg/png/webp), with a preview thumbnail once uploaded. Client-side only using `URL.createObjectURL` — no backend needed.
- **Personal message**: textarea (max 200 chars) with character counter, placeholder "Write a heartfelt message..."
- **Handwritten note toggle**: checkbox option "Include a handwritten card" (free)
- Styled consistently with the existing minimal/font-light design language

**2. Update `src/components/product/ProductInfo.tsx`**
- Import and render `<GiftPersonalisation />` between the product details and the quantity/add-to-bag section
- Lift personalisation state (photo, message, handwritten toggle) so it can be passed with the "Add to Bag" action

**3. Update `src/pages/Checkout.tsx`**
- Show personalisation details in the order summary next to each cart item (e.g., "Personalised: Photo included, Message included")
- Display the uploaded photo thumbnail and a truncated message preview

### Technical Details
- Photo upload is purely client-side (FileReader / object URL) — no storage backend required at this stage
- Textarea uses the existing `Textarea` UI component; file input is styled as a dashed drop zone
- Uses `lucide-react` icons: `Upload`, `ImagePlus`, `MessageSquare`, `PenLine`
- Character limit enforced via `maxLength` on textarea + visible counter

