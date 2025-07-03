// pages/api/proposals/[id]/withdraw.ts
import { prisma } from '@/lib/prisma'; // adjust path
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const proposalId = Number(req.query.id);

  try {
    const updated = await prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'REJECTED' },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Withdraw failed:', error);
    res.status(500).json({ error: 'Unable to withdraw proposal' });
  }
}
