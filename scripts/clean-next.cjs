/**
 * Borra `.next` de forma robusta (Windows + OneDrive suelen romper symlinks
 * y Next falla con EINVAL al hacer readlink en recursive-delete).
 */
const fs = require('fs')
const path = require('path')

const nextDir = path.join(__dirname, '..', '.next')

function delay(ms) {
  const start = Date.now()
  while (Date.now() - start < ms) {
    /* espera activa breve */
  }
}

for (let attempt = 0; attempt < 8; attempt++) {
  try {
    if (fs.existsSync(nextDir)) {
      fs.rmSync(nextDir, { recursive: true, force: true })
    }
    console.log('[clean-next] Carpeta .next eliminada.')
    process.exit(0)
  } catch (err) {
    if (attempt === 7) {
      console.error('[clean-next] No se pudo borrar .next:', err.message)
      console.error(
        '  Cerrá el servidor de desarrollo, pausá OneDrive un momento y volvé a ejecutar npm run dev.',
      )
      process.exit(1)
    }
    delay(250 * (attempt + 1))
  }
}
