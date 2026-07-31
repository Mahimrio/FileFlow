import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const job1 = await prisma.conversionJob.create({
    data: {
      sourceFileName: 'document.pdf',
      sourceFormat: 'pdf',
      targetFormat: 'docx',
      storageKeySource: 'uploads/demo-pdf-key',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  })

  const job2 = await prisma.conversionJob.create({
    data: {
      sourceFileName: 'image.png',
      sourceFormat: 'png',
      targetFormat: 'webp',
      storageKeySource: 'uploads/demo-png-key',
      storageKeyResult: 'results/demo-webp-key',
      status: 'COMPLETED',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  console.log('Seed data created:', { job1: job1.id, job2: job2.id })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
