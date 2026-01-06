import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Récupérer les conversations de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les messages où l'utilisateur est soit l'expéditeur soit le destinataire
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: (session.user as any).id },
          { receiverId: (session.user as any).id },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            image: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Grouper les messages par conversation (paire d'utilisateurs)
    const conversationsMap = new Map();

    messages.forEach((message: (typeof messages)[number]) => {
      const otherUserId =
        message.senderId === (session.user as any).id
          ? message.receiverId
          : message.senderId;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          otherUser:
            message.senderId === (session.user as any).id
              ? message.receiver
              : message.sender,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      // Compter les messages non lus
      if (message.receiverId === (session.user as any).id && !message.isRead) {
        conversationsMap.get(otherUserId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des conversations" },
      { status: 500 }
    );
  }
}

// POST - Envoyer un nouveau message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, content } = body;

    if (!receiverId || !content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Destinataire et contenu requis" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: (session.user as any).id,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            image: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
