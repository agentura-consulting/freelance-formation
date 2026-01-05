
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer le compte de test obligatoire (john@doe.com)
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      fullName: 'John Doe',
      role: 'FORMATEUR_ADMIN',
    }
  });

  console.log('✅ Compte test créé:', testUser.email);

  // Créer un apprenant de test (en ligne)
  const learnerPassword = await bcrypt.hash('learner123', 12);
  
  const testLearner = await prisma.user.upsert({
    where: { email: 'marie@test.com' },
    update: {},
    create: {
      email: 'marie@test.com',
      password: learnerPassword,
      fullName: 'Marie Dupont',
      role: 'APPRENANT',
      clientType: 'EN_LIGNE',
      bio: 'Passionnée de développement web et toujours en apprentissage !',
    }
  });

  console.log('✅ Apprenant test créé:', testLearner.email);

  // Créer un apprenant présentiel de test
  const presLearnerPassword = await bcrypt.hash('presentiel123', 12);
  
  const testPresLearner = await prisma.user.upsert({
    where: { email: 'jean@test.com' },
    update: {},
    create: {
      email: 'jean@test.com',
      password: presLearnerPassword,
      fullName: 'Jean Martin',
      role: 'APPRENANT',
      clientType: 'PRESENTIEL',
      bio: 'Apprenant en formation présentielle à Antananarivo',
    }
  });

  console.log('✅ Apprenant présentiel test créé:', testPresLearner.email);

  // Créer le compte admin unique
  const adminPassword = await bcrypt.hash('moiuniquement', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      password: adminPassword,
      fullName: 'Administrateur Système',
      role: 'ADMIN',
    }
  });

  console.log('✅ Compte admin créé:', adminUser.email);

  // Créer quelques formations de démonstration
  const formations = [
    {
      title: 'Introduction au Développement Web',
      description: 'Apprenez les bases du développement web avec HTML, CSS et JavaScript. Cette formation gratuite vous donnera toutes les connaissances fondamentales pour débuter dans le développement web.',
      category: 'Développement Web',
      level: 'DEBUTANT' as const,
      isPublished: true,
    },
    {
      title: 'Design UI/UX avec Figma',
      description: 'Maîtrisez les principes du design d\'interface et d\'expérience utilisateur. Apprenez à utiliser Figma pour créer des interfaces modernes et attractives.',
      category: 'Design',
      level: 'INTERMEDIAIRE' as const,
      isPublished: true,
    },
    {
      title: 'Marketing Digital pour Débutants',
      description: 'Découvrez les stratégies de marketing digital essentielles. De la création de contenu aux réseaux sociaux, cette formation couvre tous les aspects du marketing en ligne.',
      category: 'Marketing Digital',
      level: 'DEBUTANT' as const,
      isPublished: false,
    }
  ];

  for (const formationData of formations) {
    const formation = await prisma.formation.create({
      data: {
        ...formationData,
        creatorId: testUser.id,
      }
    });

    console.log('✅ Formation créée:', formation.title);

    // Créer quelques inscriptions pour les formations publiées
    if (formation.isPublished) {
      await prisma.enrollment.create({
        data: {
          userId: testLearner.id,
          formationId: formation.id,
          progress: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : 0,
        }
      });

      console.log('✅ Inscription créée pour:', formation.title);
    }
  }

  // Créer des publications dans la communauté
  const post1 = await prisma.post.create({
    data: {
      content: 'Bonjour à tous ! Je suis ravi de rejoindre la communauté Digital Mada Academy. Qui a des conseils pour débuter en développement web ? 🚀',
      authorId: testLearner.id,
    }
  });

  const post2 = await prisma.post.create({
    data: {
      content: 'Nouvelle formation disponible sur le design UI/UX ! N\'hésitez pas à vous inscrire, les places sont limitées. #Design #Formation',
      authorId: testUser.id,
      isPinned: true,
    }
  });

  console.log('✅ Publications créées');

  // Créer des commentaires
  await prisma.comment.create({
    data: {
      content: 'Bienvenue Marie ! Je te recommande de commencer par les fondamentaux HTML/CSS 👍',
      postId: post1.id,
      authorId: testUser.id,
    }
  });

  await prisma.comment.create({
    data: {
      content: 'Merci pour le conseil ! J\'ai hâte de commencer.',
      postId: post1.id,
      authorId: testLearner.id,
    }
  });

  console.log('✅ Commentaires créés');

  // Créer des réactions
  await prisma.reaction.create({
    data: {
      type: 'LIKE',
      postId: post1.id,
      userId: testUser.id,
    }
  });

  await prisma.reaction.create({
    data: {
      type: 'CELEBRATE',
      postId: post2.id,
      userId: testLearner.id,
    }
  });

  console.log('✅ Réactions créées');

  // Créer des messages
  await prisma.message.create({
    data: {
      content: 'Bonjour John, j\'ai une question concernant la formation HTML/CSS. Quand commence-t-elle ?',
      senderId: testLearner.id,
      receiverId: testUser.id,
    }
  });

  await prisma.message.create({
    data: {
      content: 'Bonjour Marie, la formation commence dès que vous vous inscrivez ! Vous pouvez avancer à votre rythme.',
      senderId: testUser.id,
      receiverId: testLearner.id,
      isRead: true,
    }
  });

  console.log('✅ Messages créés');

  // Créer des notes de coaching
  await prisma.coachingNote.create({
    data: {
      title: 'Première évaluation',
      content: 'Marie montre une excellente motivation et progresse rapidement. Je recommande de continuer sur cette lancée et d\'explorer les projets pratiques.',
      coachId: testUser.id,
      clientId: testLearner.id,
      isVisible: true,
    }
  });

  await prisma.coachingNote.create({
    data: {
      title: 'Points à améliorer',
      content: 'Travailler davantage sur les concepts de CSS Grid et Flexbox. Prévoir une session de révision la semaine prochaine.',
      coachId: testUser.id,
      clientId: testLearner.id,
      isVisible: false,
    }
  });

  console.log('✅ Notes de coaching créées');

  // Ajouter des modules et exercices à la première formation
  const firstFormation = await prisma.formation.findFirst({
    where: { isPublished: true }
  });

  if (firstFormation) {
    const module1 = await prisma.module.create({
      data: {
        title: 'Introduction au HTML',
        description: 'Découvrez les bases du langage HTML et créez votre première page web',
        order: 1,
        formationId: firstFormation.id,
      }
    });

    await prisma.exercise.create({
      data: {
        title: 'Créer votre première page HTML',
        description: 'Créez une page HTML simple avec un titre, un paragraphe et une image',
        type: 'TEXT',
        required: true,
        order: 1,
        moduleId: module1.id,
      }
    });

    const module2 = await prisma.module.create({
      data: {
        title: 'Styliser avec CSS',
        description: 'Apprenez à donner du style à vos pages avec CSS',
        order: 2,
        formationId: firstFormation.id,
      }
    });

    await prisma.exercise.create({
      data: {
        title: 'Appliquer des styles CSS',
        description: 'Ajoutez des styles CSS à votre page HTML pour la rendre attrayante',
        type: 'FILE',
        required: false,
        order: 1,
        moduleId: module2.id,
      }
    });

    console.log('✅ Modules et exercices créés');
  }

  console.log('🎉 Seeding terminé avec succès !');
  console.log('');
  console.log('📧 Comptes de test créés:');
  console.log('   • Admin: admin@admin.com / moiuniquement');
  console.log('   • Formateur: john@doe.com / johndoe123');
  console.log('   • Apprenant en ligne: marie@test.com / learner123');
  console.log('   • Apprenant présentiel: jean@test.com / presentiel123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors du seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
