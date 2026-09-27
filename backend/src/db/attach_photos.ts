import { db } from './client';

async function updatePhotos() {
  await db.init();
  
  await db.query(`
    UPDATE complaints 
    SET before_photos = $1 
    WHERE id = 'MC-2026-00125'
  `, [['/uploads/tap-leak-before.svg']]);

  await db.query(`
    UPDATE complaints 
    SET before_photos = $1, after_photos = $2 
    WHERE id = 'MC-2026-00127'
  `, [['/uploads/cabinet-hinge-before.svg'], ['/uploads/cabinet-hinge-after.svg']]);

  await db.query(`
    UPDATE complaints 
    SET before_photos = $1, after_photos = $2 
    WHERE id = 'MC-2026-00129'
  `, [['/uploads/ac-unit-before.svg'], ['/uploads/ac-unit-after.svg']]);

  await db.query(`
    UPDATE complaints 
    SET before_photos = $1 
    WHERE id = 'MC-2026-00126'
  `, [['/uploads/socket-spark-before.svg']]);

  console.log('✅ Successfully updated complaints with sample photos');
  process.exit(0);
}

updatePhotos().catch(err => {
  console.error('Failed to update photos:', err);
  process.exit(1);
});
