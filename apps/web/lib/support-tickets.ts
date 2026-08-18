import { prisma } from '@aistartupimpact/database';

interface CreateTicketInput {
  subject: string;
  description: string;
  category?: string;
  priority?: string;
  portal: string;
  submitterType: string;
  submitterId: string;
  submitterEmail: string;
  submitterName: string;
}

export async function createTicket(input: CreateTicketInput) {
  const result = await prisma.$queryRaw<[{ nextval: bigint }]>`
    SELECT nextval('support_ticket_seq')
  `;
  const ticketNumber = `TKT-${String(Number(result[0].nextval)).padStart(5, '0')}`;

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber,
      subject: input.subject,
      description: input.description,
      category: (input.category as any) || 'OTHER',
      priority: (input.priority as any) || 'MEDIUM',
      status: 'OPEN',
      portal: input.portal as any,
      submitterType: input.submitterType,
      submitterId: input.submitterId,
      submitterEmail: input.submitterEmail,
      submitterName: input.submitterName,
    },
  });

  return ticket;
}

export async function getTicketsForUser(
  submitterType: string,
  submitterId: string,
  page = 1,
  limit = 20,
  status?: string,
) {
  const where: any = { submitterType, submitterId };
  if (status && status !== 'ALL') where.status = status;

  const [tickets, totalCount] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return {
    tickets,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getTicketDetail(
  ticketId: string,
  submitterType: string,
  submitterId: string,
  includeInternal = false,
) {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, submitterType, submitterId },
    include: {
      messages: {
        where: includeInternal ? {} : { isInternal: false },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return ticket;
}

export async function addUserMessage(
  ticketId: string,
  submitterType: string,
  submitterId: string,
  senderName: string,
  body: string,
) {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, submitterType, submitterId },
  });

  if (!ticket) return null;

  const message = await prisma.supportTicketMessage.create({
    data: {
      ticketId,
      senderType: 'USER',
      senderId: submitterId,
      senderName,
      body,
      isInternal: false,
    },
  });

  if (ticket.status === 'RESOLVED' || ticket.status === 'AWAITING_USER') {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'OPEN' },
    });
  }

  return message;
}
