/*
# Preserve existing gallery photos

1. Data preservation
- Adds the three existing public business photos to the new gallery metadata table.
- Existing external image URLs remain usable while new admin uploads use Supabase Storage.
2. Public behavior
- All seeded photos are published and appear in the public gallery.
*/

INSERT INTO public.gallery_photos (storage_path, title, description, category, published)
VALUES
  ('https://lh3.googleusercontent.com/D8DAWXf2yPa0JsHcFOGHnty7dYW_8vJp00AbwMa2FCM9wE5t0F3l2lr35vi8TOQejmCbkG9GxvEgg2zmoNBf_39pJjr3hcWZyE8bzlHb=w1600-rw', 'Training vehicle', 'Sri Sagar Driving School training vehicle', 'Vehicles', true),
  ('https://lh3.googleusercontent.com/w52W9zz0Dwm7W4six5EatcGu64cqckOYXDH_cBuH5gIa4pc8-zj4VZVhu7eZ-_THbbVkvODc6OObRd0e8gWQvUGYBEHIKfrCCXuJiXkw=w800-rw', 'Driving practice', 'Sri Sagar Driving School vehicle', 'Training', true),
  ('https://img.magicpin.com/7806065_store_images_1.webp', 'School photo', 'Sri Sagar Driving School public listing photo', 'School', true)
ON CONFLICT (storage_path) DO NOTHING;
