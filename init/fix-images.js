/**
 * Fix images for legacy listings that have null, empty, or Cloudinary image URLs.
 * Assigns a relevant Unsplash photo based on the listing's category or title keywords.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Listing = require('../models/listing.js');

const CATEGORY_IMAGES = {
  'Trending':       'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&auto=format&fit=crop',
  'Rooms':          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&auto=format&fit=crop',
  'Iconic Cities':  'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&auto=format&fit=crop',
  'Mountains':      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop',
  'Castles':        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop',
  'Amazing Pools':  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&auto=format&fit=crop',
  'Camping':        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&auto=format&fit=crop',
  'Farms':          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop',
  'Arctic':         'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&auto=format&fit=crop',
  'Domes':          'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=1200&auto=format&fit=crop',
  'Boats':          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop',
  'default':        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&auto=format&fit=crop',
};

// Extra keyword-based overrides for well-known listing titles
const TITLE_KEYWORD_IMAGES = {
  'ganges':    'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&auto=format&fit=crop',
  'french quarter': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1200&auto=format&fit=crop',
  'boutique':  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&auto=format&fit=crop',
  'spiritual': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&auto=format&fit=crop',
  'villa':     'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&auto=format&fit=crop',
  'beach':     'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop',
  'mountain':  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop',
  'lake':      'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=1200&auto=format&fit=crop',
  'forest':    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop',
  'cozy':      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop',
  'cottage':   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop',
  'apartment': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop',
};

function pickImage(listing) {
  const titleLower = (listing.title || '').toLowerCase();
  for (const [keyword, url] of Object.entries(TITLE_KEYWORD_IMAGES)) {
    if (titleLower.includes(keyword)) return url;
  }
  return CATEGORY_IMAGES[listing.category] || CATEGORY_IMAGES['default'];
}

async function main() {
  await mongoose.connect(process.env.ATLAS_URL);
  console.log('✅  Connected to Atlas');

  const all = await Listing.find({});
  const toFix = all.filter(l => {
    const url = l.image && l.image.url;
    // Fix if: no url, default placeholder, cloudinary, or old S3 URL
    return !url
      || url.includes('res.cloudinary.com')
      || url === 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=2865&auto=format&fit=crop'
      || url.trim() === '';
  });

  console.log(`Found ${toFix.length} listings needing image fix`);

  let fixed = 0;
  for (const listing of toFix) {
    const newUrl = pickImage(listing);
    await Listing.findByIdAndUpdate(listing._id, {
      'image.url': newUrl,
      'image.filename': 'seed-auto'
    });
    console.log(` ✓ Fixed: ${listing.title} → ${newUrl.substring(0, 60)}...`);
    fixed++;
  }

  console.log(`\n✅  Fixed ${fixed} listings`);
  await mongoose.disconnect();
}

main().catch(err => { console.error('❌  Error:', err); process.exit(1); });
