const produtos = [
    {
        id: 2,
        nome: "Canoa",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/canoa-stik.png",
        descricao: "Desbloqueie o potencial máximo da sua linha de produção industrial e garanta um desempenho superior na confecção. O Canoa é o nosso elástico cru de altíssima resistência e robustez, projetado para durar por um longo ciclo de vida. Sua superfície, propositalmente levemente áspera, proporciona uma aderência superior e maior firmeza no processo de costura industrial, garantindo que o acabamento seja sempre firme, seguro e profissional. Ele oferece máxima durabilidade e excelente estabilidade dimensional, sendo a base ideal e robusta para projetos exigentes, onde a qualidade técnica e a autenticidade do material em seu estado natural são a principal prioridade do seu vestuário.",
        material: "Elástico",
    },
    {
        id: 3,
        nome: "Cinta",
        categoria: "Modeladores",
        imagem: "./img/Modeladores/cinta-stik.png",
        descricao: "Crie peças que modelam com conforto e segurança inigualáveis, redefinindo o padrão de vestuário de compressão. O elástico Cinta foi desenvolvido especificamente para modeladores e vestuário de compressão, oferecendo uma compressão controlada que esculpe e valoriza a silhueta sem sacrificar o bem-estar do usuário. Sua excelente recuperação elástica e alta resistência ao uso contínuo garantem que a peça jamais perca a forma ou sua capacidade de compressão, mesmo após muitas lavagens. É a escolha definitiva para roupas que buscam um ajuste firme, sustentação localizada e um toque sofisticado de alto padrão, assegurando que o produto final seja valorizado pela performance, durabilidade e caimento.",
        material: "Políester",
    },
    {
        id: 4,
        nome: "Alca Atena",
        categoria: "Personalizados",
        imagem: "./img/Personalizados/alcaatena-stik.png",
        descricao: "Dê vida à sua marca e a eleve a um novo patamar de exclusividade, requinte e sofisticação. Alça Atena é a solução de acabamento premium totalmente personalizada para atender e materializar o seu design e identidade visual. Por ser sob demanda, pode ser desenvolvida em uma ampla variedade de cores, padrões, texturas e larguras, adaptando-se perfeitamente a qualquer necessidade da sua coleção. Este produto não apenas oferece alta resistência e um toque extremamente refinado, mas também se torna um diferencial estético poderoso, capaz de capturar olhares e agregar valor inestimável à sua coleção de moda íntima e vestuário de luxo, fortalecendo o branding.",
        material: "Elástico",
    },
    {
        id: 5,
        nome: "Belly",
        categoria: "Premium",
        imagem: "./img/Premium/belly-stik.png",
        descricao: "Sinta o luxo, a maciez e a excelência em cada detalhe de suas criações de alto padrão. O Belly é a materialização do elástico premium, destacando-se notavelmente por seu toque acetinado e uma resistência incomparável ao desgaste diário, atrito e à tensão. Essencial para peças de alta-costura, coleções exclusivas e linhas de luxo, ele entrega não apenas uma aparência sofisticada e visualmente rica que encanta o consumidor, mas também um desempenho elástico funcional, consistente e uma durabilidade notável, confirmando a alta qualidade e o valor agregado da sua produção.",
        material: "Elástico",
    },
    {
        id: 6,
        nome: "Ana",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/ana-stik.png",
        descricao: "Inspire delicadeza e garanta a longevidade e a beleza da sua lingerie por um ciclo de vida estendido. A renda Ana possui alta estabilidade dimensional e um acabamento técnico que facilita e otimiza o processo de costura em larga escala industrial. Ela garante que a elegância, o charme e o design vazado da sua peça permaneçam inalterados e vibrantes, mesmo após diversas lavagens e uso contínuo, sem deformar. É o produto ideal para quem busca combinar a beleza, a sensibilidade e o apelo estético da renda com a funcionalidade e a durabilidade exigidas pelo rigoroso mercado de moda íntima e vestuário fino.",
        material: "Elástico",
    },
    {
        id: 7,
        nome: "Magno",
        categoria: "Alça",
        imagem: "./img/Alças/magno-stik.png",
        descricao: "Desenvolva peças que oferecem segurança, suporte inabalável e conforto de uso prolongado. Magno é uma alça robusta e extremamente confortável, especialmente formulada com alta tecnologia para suportar grandes tensões, peso e tração sem ceder, esticar ou perder sua forma original. Com bordas reforçadas, toque agradável e construção densa, é a escolha definitiva e de confiança para peças que exigem máxima sustentação, como sutiãs de tamanhos maiores, tops de alta performance ou vestuário técnico, sem abrir mão do conforto ideal para o usuário.",
        material: "Elástico",
    },
    {
        id: 11,
        nome: "Agda",
        categoria: "Viés",
        imagem: "img/agda-stik.png",
        descricao: "Obtenha acabamentos profissionais, impecáveis e de longa duração com o viés Agda. Este produto é notavelmente flexível, extremamente resistente e ideal para ser aplicado em bordas e reforços de costuras, oferecendo um fechamento limpo e seguro. Sua maleabilidade superior facilita o trabalho em curvas, contornos complexos e detalhes arredondados, sendo um aliado crucial na produção em escala. Garante um resultado final elegante, duradouro e com aquele toque profissional que é crucial para elevar a percepção de qualidade do seu vestuário, assegurando a integridade e o visual da peça por mais tempo.",
        material: "Elástico",
    },
    {
        id: 12,
        nome: "Atlas",
        categoria: "Viés Com Arco",
        imagem: "img/atlas-stik.png",
        descricao: "Inove o design dos seus modeladores e peças íntimas com suporte técnico superior e discreto embutido. Atlas é o nosso elástico que já possui o arco integrado, sendo projetado especificamente para dar uma estrutura extra e localizada a corsets, sutiãs e modeladores. Ele consegue unir a firmeza necessária e essencial para a modelagem perfeita com o conforto para o uso diário, proporcionando liberdade. É um produto ideal para peças que exigem um suporte técnico localizado, garantindo que a forma original e o visual refinado da roupa sejam mantidos com excelência, valorizando a silhueta de maneira eficaz.",
        material: "Elástico",
    },
    {
        id: 14,
        nome: "Chll",
        categoria: "Premium",
        imagem: "img/chll-stik.png",
        descricao: "Crie coleções com um visual moderno, caimento impecável e um desempenho de elite que se destaca no mercado. O Chll é parte fundamental da nossa linha premium, destacando-se pela resistência superior à deformação, ao estiramento e por um caimento estruturado e elegante. É o material ideal para marcas que buscam peças com um estilo contemporâneo, alta durabilidade e excelente apresentação visual. Ele garante que a sofisticação e o design inovador permaneçam intactos por muito mais tempo, reforçando a qualidade e o alto padrão dos seus produtos premium, assegurando a fidelidade da forma.",
        material: "Elástico",
    },

    /* --- Itens adicionados automaticamente a partir de img - Copia (Revisados) --- */
    // Alças
    {
        id: 16,
        nome: "Dayane",
        categoria: "Alças",
        imagem: "img - Copia/Alças/dayane-stik.png",
        descricao: "Proporcione segurança e leveza essenciais para o uso diário e prolongado em peças de base. Dayane é a alça desenvolvida com elasticidade perfeitamente balanceada, pensada para o máximo conforto e um suporte seguro que acompanha cada movimento do corpo. É o material ideal para sutiãs, tops e vestuário que necessitam de um suporte confiável e discreto, garantindo o ajuste sem comprometer a leveza e a sensação de bem-estar ao longo do dia. Sua composição evita o excesso de pressão, valorizando a experiência do usuário.",
        material: "Elástico"
    },
    {
        id: 17,
        nome: "Iris",
        categoria: "Alças",
        imagem: "img - Copia/Alças/Iris-stik.png",
        descricao: "A durabilidade técnica que suas peças íntimas merecem, garantindo um ciclo de vida estendido e maior satisfação. Iris é a alça macia ao toque e altamente resistente ao desgaste, ao atrito e à fadiga do material, perfeita para lingeries de uso contínuo. Sua construção robusta permite uma fixação eficiente em reguladores, o que garante um ajuste preciso, duradouro e confortável, acompanhando a forma do corpo em todos os momentos com consistência e segurança, sem escorregar ou afrouxar.",
        material: "Elástico"
    },
    {
        id: 19,
        nome: "Mirela",
        categoria: "Alças",
        imagem: "img - Copia/Alças/mirela-stik.png",
        descricao: "Adicione um toque de requinte, brilho sutil e suavidade em suas coleções que definem o luxo. Mirela é a alça com acabamento acetinado e toque excepcionalmente delicado, sendo a escolha ideal para lingeries e vestuário que se enquadram na categoria premium e de alta-costura. Ela une um visual incrivelmente refinado e elegante com um desempenho elástico funcional e superior, elevando o valor percebido das suas criações e solidificando sua posição no mercado de luxo pela qualidade estética e técnica.",
        material: "Elástico"
    },
    {
        id: 20,
        nome: "Nadia",
        categoria: "Alças",
        imagem: "img - Copia/Alças/nadia-stik.png",
        descricao: "Busque máxima versatilidade e confiança estrutural para diversos designs de vestuário. Nadia é a alça que se destaca por ser altamente durável e versátil, pronta para ser aplicada desde moda íntima de base e sutiãs, até acessórios de vestuário que exigem mais resistência e tração. Sua construção robusta garante a combinação perfeita entre resistência estrutural e flexibilidade ideal, adaptando-se a diferentes estilos e necessidades de costura com grande facilidade e consistência, oferecendo um excelente custo-benefício.",
        material: "Elástico"
    },

    // Bases
    {
        id: 21,
        nome: "Caricia",
        categoria: "Bases",
        imagem: "img - Copia/Bases/caricia-stik.png",
        descricao: "Confeccione bases e cós com conforto superior e maleabilidade que abraçam o corpo de forma suave. Carícia é a base macia ideal para cós e acabamentos internos, graças ao seu toque suave na pele e excelente capacidade de recuperação elástica. Ela é a garantia de conforto absoluto para peças que estão em contato direto com a pele, proporcionando uma experiência agradável e de bem-estar a cada uso, sem perder a capacidade de ajuste e de manter a forma do vestuário com discrição e leveza.",
        material: "Elástico"
    },
    {
        id: 22,
        nome: "Cintra",
        categoria: "Bases",
        imagem: "img - Copia/Bases/cintra-stik.png",
        descricao: "Estrutura e suporte firme sem a sensação incômoda de rigidez, garantindo caimento. Cintra é a base com estabilidade dimensional superior e comprovada, o que a torna perfeita para estruturar cós, bustos e barras de forma eficaz. Oferece o suporte técnico necessário com uma flexibilidade ideal para o movimento, garantindo peças que são seguras, confortáveis e com um caimento que se mantém impecável ao longo do tempo de uso e ciclos de lavagens. Ideal para bases de sutiãs e tops que precisam de sustentação.",
        material: "Elástico"
    },
    {
        id: 23,
        nome: "Diana",
        categoria: "Bases",
        imagem: "img - Copia/Bases/diana-stik (1).png",
        descricao: "Encontre o equilíbrio perfeito entre compressão leve e liberdade de movimento total para suas peças. Diana oferece um suporte balanceado e uma recuperação elástica excepcional, tornando-a a escolha ideal para peças que precisam de uma leve compressão e estabilidade duradoura. Sua composição técnica assegura que a forma e o conforto da roupa sejam mantidos com consistência, mesmo após ser usada e lavada repetidas vezes, garantindo um produto de alta qualidade e longevidade para o dia a dia.",
        material: "Elástico"
    },
    {
        id: 24,
        nome: "Lady",
        categoria: "Bases",
        imagem: "img - Copia/Bases/lady-stik.png",
        descricao: "Sofisticação e performance garantidas para suas coleções de alto padrão de luxo. Lady é a base com acabamento premium e um toque extremamente agradável, sedoso e macio, além de alta resistência ao estiramento e à fadiga do material. É desenvolvida especificamente para coleções de luxo, oferecendo conforto prolongado, durabilidade superior e elevando instantaneamente o nível de sofisticação e o valor percebido de cada peça produzida, do cós ao busto, com um visual refinado e elegante.",
        material: "Elástico"
    },
    {
        id: 25,
        nome: "Leno",
        categoria: "Bases",
        imagem: "img - Copia/Bases/leno-stik.png",
        descricao: "Obtenha a firmeza e a flexibilidade ideais e controladas para o seu design estruturado e exigente. Leno é a base robusta para peças que exigem firmeza superior e flexibilidade controlada, como vestuário esportivo de alta compressão e modeladores. É a solução perfeita para cós e barras que precisam manter a forma e a estrutura mesmo sob uso e tensão intensa, garantindo qualidade técnica, resistência e longevidade em cada aplicação industrial, com excelente retorno elástico.",
        material: "Elástico"
    },
    {
        id: 26,
        nome: "Nayane",
        categoria: "Bases",
        imagem: "img - Copia/Bases/nayane-stik.png",
        descricao: "Consistência de alta performance garantida para a sua produção em grande escala e alta demanda. Nayane é a base que garante um padrão de qualidade consistente e uniforme em todas as tiragens, com acabamento impecável e alta fidelidade ao design original. Sua composição técnica garante durabilidade e mantém a integridade estrutural da peça após diversas lavagens e ciclos de uso, sendo um material confiável que valoriza cada detalhe final da sua produção, otimizando o processo de costura.",
        material: "Elástico"
    },

    // Elásticos Crus
    {
        id: 27,
        nome: "Beta",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/beta-stik (1).png",
        descricao: "O ponto de partida essencial para a qualidade, robustez e alta performance na sua linha de produção. Beta é o elástico cru projetado para máxima durabilidade e estabilidade dimensional na sua forma mais pura e natural. É a matéria-prima ideal para ser utilizada em processos industriais que demandam material extremamente resistente, sem tingimento, e com um desempenho técnico superior garantido em todas as etapas da sua linha de produção, estando pronto para tingimento e acabamento final sem surpresas ou deformações.",
        material: "Elástico"
    },
    {
        id: 30,
        nome: "Flor",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/flor-stik (2).png",
        descricao: "Flexibilidade essencial e versatilidade para inovar em seus designs de moda íntima e vestuário. Flor é o elástico cru versátil, que se destaca pela sua excelente capacidade de recuperação elástica e toque macio. É indicado para múltiplas aplicações onde a flexibilidade é o fator crucial, garantindo um desempenho de base sólido e adaptável antes de receber o tingimento ou acabamento final, mantendo a integridade da fibra e a elasticidade de forma consistente para diferentes tipos de peças.",
        material: "Elástico"
    },
    {
        id: 31,
        nome: "Fortim",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/fortim-stik.png",
        descricao: "A base inabalável da sua resistência estrutural, confiabilidade e alta compressão. Fortim é o elástico cru de altíssima robustez e construção densa, desenvolvido para ser aplicado em peças que exigem máxima firmeza e resistência à tensão e ao estiramento. Ele é a garantia de durabilidade e fornece uma estrutura sólida e confiável para o vestuário que será submetido a um uso intenso e prolongado, como uniformes, equipamentos técnicos ou modeladores, mantendo a forma e a função.",
        material: "Elástico"
    },
    {
        id: 32,
        nome: "Iracema",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/iracema-stik.png",
        descricao: "O preparo perfeito e técnico para receber a cor com fidelidade, vivacidade e consistência. Iracema é o elástico cru que entrega um desempenho elástico consistente e uniforme, sendo a base ideal para produtos que precisam de estabilidade e estão prontos para entrar em processos de coloração e tingimento. Ele mantém a qualidade e a elasticidade essenciais antes de receber o toque final e se transformar em um produto acabado de alta qualidade, sem alteração dimensional indesejada, otimizando o processo produtivo de cores.",
        material: "Elástico"
    },
    {
        id: 33,
        nome: "Jeri",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/jeri-stik.png",
        descricao: "Ganhe agilidade e mantenha a qualidade na sua linha de produção industrial com excelência e facilidade. Jeri é o elástico cru que se destaca por ser de fácil manuseio e costura e por possuir excelente resistência ao rasgo e ao atrito. É ideal para confecções que valorizam a praticidade, a rapidez na montagem e a otimização de tempo, garantindo uma estrutura sólida e de qualidade em cada etapa do processo produtivo, entregando um produto final robusto e bem acabado.",
        material: "Elástico"
    },
    {
        id: 34,
        nome: "Plla",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/plla-stik.png",
        descricao: "Alto desempenho técnico para as maiores demandas e exigências do mercado de vestuário. Plla é o elástico cru técnico, perfeito para processos industriais exigentes, de grande volume de produção e que necessitam de máxima performance. Ele oferece a firmeza, a durabilidade e o desempenho superior necessários para o uso em larga escala, com uma garantia de qualidade que assegura a padronização e a consistência do seu produto final em todas as remessas, sendo ideal para peças estruturadas.",
        material: "Elástico"
    },
    {
        id: 35,
        nome: "Plus II",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/plusii-stik.png",
        descricao: "A garantia técnica de que o ajuste será mantido, sempre com a máxima precisão dimensional. Plus II é o elástico cru que possui estabilidade dimensional excepcional, o que minimiza o risco de encolhimento ou alargamento indesejado após processos. É um material essencial para garantir que as medidas das peças sejam preservadas e não se alterem, mesmo após os processos de tingimento e acabamento, mantendo a qualidade e o encaixe perfeito da roupa, fundamental para o controle de qualidade.",
        material: "Elástico"
    },
    {
        id: 36,
        nome: "Grecia",
        categoria: "Alças",
        imagem: "img - Copia/Alças/grecia-stik (1).png",
        descricao: "Uma alça técnica que garante a precisão do ajuste final e a integridade dimensional da peça. Grecia é a solução técnica para manter a integridade dimensional de suas peças, especialmente em ambientes de alta tensão e uso contínuo. Sua formulação e construção garantem que as medidas da roupa sejam mantidas e estáveis mesmo após passarem por todos os processos de tingimento e acabamento, entregando um resultado final que veste perfeitamente, agrada o consumidor e mantém a durabilidade e o suporte essencial.",
        material: "Elástico"
    },

    // Modeladores
    {
        id: 37,
        nome: "Cintarela",
        categoria: "Modeladores",
        imagem: "img - Copia/Modeladores/cintarela2-stik (1).png",
        descricao: "Desenvolva modeladores com definição de silhueta, conforto e durabilidade inigualáveis para o mercado premium. Cintarela é o elástico que proporciona um suporte firme e um ajuste preciso em peças que demandam compressão controlada e modelagem. Sua construção robusta e tecnológica garante que o vestuário mantenha a forma e a compressão necessária por um longo período de tempo, valorizando a silhueta, o design e garantindo a satisfação do usuário. Ideal para cós de alta sustentação e peças que precisam de alta recuperação elástica.",
        material: "Elástico"
    },

    {
        id: 39,
        nome: "Belly",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/bellypersonalisados-stik.png",
        descricao: "Adicione um toque de luxo, sofisticação e personalidade à sua linha premium de vestuário. Esta é a versão customizada do elástico Belly, apresentando um acabamento diferenciado, toque acetinado e resistência superior ao desgaste e à tensão. O produto adiciona um toque exclusivo e visualmente rico às suas peças, mantendo o alto desempenho elástico e a qualidade que são esperados de um material premium, levando a sua marca para o destaque no acabamento.",
        material: "Elástico"
    },
    {
        id: 40,
        nome: "Fenix",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/fenix-stik.png",
        descricao: "A sua identidade em destaque com performance técnica e confiável em cada detalhe de costura. Fenix é o elástico que possui um design exclusivo e desempenho comprovado, desenvolvido sob medida para as necessidades e padrões de design da sua marca. Ele garante que a integridade da estampa ou padrão personalizado se mantenha impecável, reforçando a comunicação visual da sua coleção e assegurando a durabilidade do design mesmo após o uso e lavagem frequentes, com alta fidelidade de cor.",
        material: "Elástico"
    },
    {
        id: 41,
        nome: "Fox",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/fox-stik.png",
        descricao: "Maximize o apelo visual customizado para todas as suas peças e garanta um impacto visual forte e memorável. Fox é o elástico personalizado e versátil, que oferece uma excelente área de impressão para a sua marca, logotipos ou padrões decorativos. Ele combina a funcionalidade e o desempenho técnico do elástico com um forte apelo visual customizado e marcante, elevando o design da sua linha de vestuário e garantindo a identidade da sua coleção em cada detalhe do cós.",
        material: "Elástico"
    },
    {
        id: 42,
        nome: "Gym",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/gym-stik.png",
        descricao: "Conquiste o mercado esportivo e fitness com estilo, alta performance e funcionalidade garantida. Gym é o elástico personalizado ideal para aplicações fitness e esportivas de alto rendimento. Ele combina alta elasticidade e uma notável resistência ao suor, umidade, cloro e ciclos de lavagens frequentes, garantindo que a personalização da sua marca permaneça intacta, independentemente da intensidade do exercício e da rotina do atleta, oferecendo durabilidade extrema.",
        material: "Elástico"
    },
    {
        id: 43,
        nome: "Jana",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/jana-stik.png",
        descricao: "Conforto e estilo pensados sob medida para o seu público mais exigente em moda íntima. Jana é o elástico que harmoniza um toque agradável e extremamente suave com um design que pode ser totalmente customizado e exclusivo. É perfeito para linhas de moda íntima que buscam detalhes personalizados e o máximo de bem-estar para o uso prolongado, oferecendo um ajuste suave, discreto e duradouro, com a marca em evidência.",
        material: "Elástico"
    },
    {
        id: 44,
        nome: "Kiss",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/kiss-stik.png",
        descricao: "A delicadeza do toque que dura e resiste ao tempo e ao desgaste do uso diário. Kiss é o elástico personalizado com toque suave e resistência ideal para o uso diário em peças delicadas. Permite a criação de designs delicados e esteticamente agradáveis, sem abrir mão da durabilidade e da resistência necessárias para peças de uso contínuo, tornando-o funcional e visualmente atraente para o consumidor final.",
        material: "Elástico"
    },
    {
        id: 45,
        nome: "Lexia",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/lexia-stik.png",
        descricao: "Design moderno com um caimento e ajuste perfeitos e duradouros, elevando a peça. Lexia é o elástico de visual contemporâneo e ótimo caimento, que oferece total possibilidade de customização com a sua marca e padrão. É a escolha ideal para coleções que priorizam um ajuste perfeito, durável e um forte apelo de design na cintura ou em acabamentos, garantindo que a peça vista de forma impecável e estruturada no corpo.",
        material: "Elástico"
    },
    {
        id: 46,
        nome: "Lion",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/lion-stik.png",
        descricao: "Força, resistência e exclusividade em suas peças mais estruturadas e de alta compressão. Lion é o elástico personalizado indicado para vestuário mais robusto, pesado ou que exige maior sustentação e compressão. Ele combina a firmeza estrutural inquestionável do material com a visibilidade e a exclusividade da sua personalização, sendo ideal para cós de alta pressão, roupas de trabalho e vestuário esportivo de impacto, garantindo suporte máximo.",
        material: "Elástico"
    },
    {
        id: 47,
        nome: "Liptus",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/liptus-stik.png",
        descricao: "Padrão consistente, confiabilidade técnica e estética garantida em larga escala industrial. Liptus é o elástico personalizado que oferece um acabamento confiável, estável e com alta fidelidade de cor e padrão em todas as tiragens. Sua consistência técnica o torna o material perfeito para tiragens industriais que exigem uma padronização rigorosa e sem falhas, garantindo a uniformidade e a qualidade do seu produto em grandes volumes de produção.",
        material: "Elástico"
    },
    {
        id: 48,
        nome: "Lisboa",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/lisboa-stik.png",
        descricao: "Elegância, estética refinada e alta resistência para o seu segmento de luxo e alta-costura. Lisboa é um elástico de estética refinada e alta resistência ao estiramento e ao desgaste, com amplas opções de customização e personalização de cor. É perfeito para agregar valor, exclusividade e um acabamento de alto padrão em peças de luxo, onde a qualidade técnica e o detalhe visual são inegociáveis, proporcionando um toque sedoso.",
        material: "Elástico"
    },
    {
        id: 50,
        nome: "Master",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/masterpersonalisado-stik.png",
        descricao: "A durabilidade e a resistência Master com a forte e marcante identidade da sua marca. Esta é a versão customizada do elástico Master, com personalização de alta durabilidade e integridade visual. Ele combina a resistência estrutural inquestionável e o suporte técnico do material com a forte e marcante identidade visual da sua marca, sendo ideal para peças que serão submetidas a uso intenso e lavagens frequentes, garantindo longevidade.",
        material: "Elástico"
    },
    {
        id: 51,
        nome: "Plus II",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/pluspesonalisados-stik.png",
        descricao: "Firmeza, conforto no ajuste e a sua assinatura em destaque no acabamento final. Este elástico equilibra sustentação e elasticidade de forma ideal, agora em uma versão totalmente customizada e fiel ao seu design. É a solução perfeita para quem busca um ajuste confortável, durável e deseja manter a marca em evidência no cós, barra ou alça, unindo qualidade técnica e estabilidade dimensional à comunicação visual com o consumidor.",
        material: "Elástico"
    },
    {
        id: 52,
        nome: "Puma",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/puma-foto.png",
        descricao: "Força, visual robusto e um estilo marcante que se destacam no vestuário esportivo e casual. Puma é o elástico com visual robusto e uma construção resistente, que permite uma customização de alto impacto e grande visibilidade da marca. É perfeito para a moda esportiva e peças que exigem um forte apelo visual, sem comprometer a durabilidade, a elasticidade e a performance do material em situações de tensão e movimento intenso, garantindo suporte e design.",
        material: "Elástico"
    },
    {
        id: 53,
        nome: "Senna",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/senna-stik.png",
        descricao: "Durabilidade técnica e a visibilidade da marca que resistem ao tempo, atrito e uso intenso. Senna é o elástico personalizado com excelente resistência ao desgaste, ao atrito e à fadiga do material. É ideal para aplicações em que a durabilidade do material e a visibilidade da marca são cruciais e precisam ser mantidas em condições de uso intenso e lavagens frequentes, como cós de calças e peças esportivas de alta frequência de uso, mantendo o acabamento impecável.",
        material: "Elástico"
    },
    {
        id: 54,
        nome: "Venus",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/venus-stik.png",
        descricao: "O toque de luxo e a suavidade em um acabamento premium e totalmente customizado. Venus é o elástico personalizado com toque suave, sedoso e acabamento superior, ideal para contato direto com a pele em peças íntimas. Ele adiciona um detalhe de luxo e conforto imediato às peças, valorizando instantaneamente a identidade e o cuidado da sua marca com o produto e a experiência do consumidor, com excelente recuperação elástica e caimento.",
        material: "Elástico"
    },
    {
        id: 55,
        nome: "Virtus",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/virtus-stik.png",
        descricao: "Confiabilidade técnica, padrão consistente e estética premium para todas as suas criações. Virtus é o elástico personalizado que oferece consistência de alto nível e um visual sofisticado e marcante, com alta fidelidade de cor. Sua construção garante um encaixe perfeito e duradouro, sendo um material de alta qualidade e ótimo caimento para peças de vestuário que exigem acabamento diferenciado e a visibilidade da marca em cós ou alças.",
        material: "Elástico"
    },
    {
        id: 56,
        nome: "X Nillo",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/xnillo-stik.png",
        descricao: "O elástico versátil, personalizado e de alta qualidade para qualquer desafio de design e costura. X Nillo é um produto com alto nível de acabamento e grande versatilidade em sua aplicação em diversos tipos de vestuário. Adapta-se com excelência a diferentes tipos de peças e métodos de costura, assegurando um resultado de alta qualidade, resistência e a visibilidade da sua marca no acabamento, desde moda íntima a roupas esportivas e de base, com durabilidade garantida.",
        material: "Elástico"
    },

    // Premium
    {
        id: 58,
        nome: "Camila",
        categoria: "Premium",
        imagem: "img - Copia/Premium/camila-stik.png",
        descricao: "Elegância superior e resistência inabalável que definem o padrão premium para suas coleções. Camila é o elástico que combina estilo, toque sedoso e uma durabilidade superior, ideal para peças de luxo. Sua textura e brilho são ideais para peças que buscam um diferencial estético marcante no acabamento e a garantia de uma longa vida útil do vestuário, confirmando o alto valor percebido da sua coleção pela excelência do material e sua capacidade de manter o design original.",
        material: "Elástico"
    },
    {
        id: 59,
        nome: "Listras",
        categoria: "Premium",
        imagem: "img - Copia/Premium/listras-stik.png",
        descricao: "Um detalhe sofisticado, moderno e durável que perdura no tempo com notável elegância. Listras é o elástico premium que apresenta um visual listrado diferenciado e resistente ao desgaste e à deformação. Adiciona um toque de design moderno, sofisticado e discreto, mantendo a qualidade técnica e o desempenho elástico superior esperado da linha premium em cós e acabamentos, com um excelente retorno elástico e estabilidade dimensional, garantindo a forma da peça.",
        material: "Elástico"
    },
    // Rendas
    {
        id: 61,
        nome: "Ana Bicolor",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/anabivolor-stik.png",
        descricao: "Contraste visual marcante, sofisticação e elegância em cada centímetro da peça. Ana Bicolor é a renda que apresenta uma padronagem em duas cores, oferecendo um contraste estético elegante, um visual profundo e um caimento excelente. É a escolha perfeita para peças que desejam um toque de cor sofisticado e um design inconfundível, unindo a delicadeza da renda à resistência técnica necessária para a produção e o uso contínuo, mantendo a integridade do desenho.",
        material: "Elástico"
    },
    {
        id: 62,
        nome: "Capi",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/capi-stik.png",
        descricao: "A versatilidade do material para compor peças elegantes e detalhes decorativos ricos e duradouros. Capi é a renda cuja estrutura técnica garante durabilidade e mantém a delicadeza do desenho original intacta, mesmo após o uso contínuo e diversas lavagens industriais. É um material confiável e de alta performance para criar composições sofisticadas, valorizando o design da lingerie e oferecendo um toque suave, com excelente maleabilidade na aplicação.",
        material: "Elástico"
    },
    {
        id: 63,
        nome: "Eva",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/eva-stik.png",
        descricao: "O máximo de conforto e suavidade extrema para áreas sensíveis e delicadas da pele. Eva é a renda de toque macio, com acabamento suave e maleável, sendo ideal para aplicações em áreas da pele que demandam maior delicadeza e bem-estar. Proporciona um conforto extremo ao vestir e um visual delicado ao produto final, garantindo a satisfação do usuário em peças de uso diário e com a leveza e beleza estética da renda.",
        material: "Elástico"
    },
    {
        id: 64,
        nome: "Ina",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/ina-stik.png",
        descricao: "Leveza, discrição e acabamento perfeito para a criação de detalhes finos e delicados. Ina é a renda que combina um visual leve e delicado com alta maleabilidade e adaptabilidade a contornos. É a escolha perfeita para aplicações em peças femininas que buscam leveza, um caimento suave e um acabamento discreto, porém elegante e sofisticado, sem comprometer a resistência e durabilidade do material no uso frequente.",
        material: "Elástico"
    },
    {
        id: 65,
        nome: "Lara",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/lara-stik.png",
        descricao: "Beleza estética, resistência e ajuste confortável sem apertar ou causar incômodo. Lara é a renda que combina leveza e resistência, ideal para ser utilizada em acabamentos de cós e pernas de calcinhas e sutiãs. Oferece um bom nível de ajuste e conforto, mantendo a beleza do padrão e garantindo que a peça fique no lugar sem causar incômodo ou compressão excessiva, valorizando a experiência do consumidor com o caimento suave e seguro.",
        material: "Elástico"
    },
    {
        id: 66,
        nome: "Luna",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/luna-stik.png",
        descricao: "O material chave para composições elegantes, sofisticadas e luxuosas no segmento de moda íntima. Luna é a renda que possui uma aparência sofisticada, um design de alto padrão e toque suave, perfeita para coleções que exigem excelência. Sua construção técnica a torna uma excelente escolha para agregar um valor percebido alto aos seus produtos, garantindo beleza duradoura, caimento impecável e excelente recuperação elástica, ideal para peças de destaque.",
        material: "Elástico"
    },
    {
        id: 67,
        nome: "Mirra",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/mirra-stik.png",
        descricao: "Acabamento primoroso para peças finas e delicadas com durabilidade e resistência garantidas. Mirra é a renda ideal para detalhes delicados e bordas de peças íntimas, unindo leveza e firmeza na medida certa. A sua delicadeza visual é complementada pela resistência necessária para o uso contínuo e lavagens, tornando-a funcional, bela e uma escolha confiável para a produção industrial que busca excelência em acabamentos rendados.",
        material: "Elástico"
    },
    {
        id: 68,
        nome: "Sofia",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/sofia-stik.png",
        descricao: "Estética e funcionalidade técnica em perfeita harmonia para um resultado superior e duradouro. Sofia é a renda que equilibra a beleza do design com o desempenho técnico. Oferece um excelente nível de elasticidade e estabilidade dimensional, sendo ideal para aplicações em que o conforto, a durabilidade do material e a manutenção da forma são essenciais para a qualidade final da peça, especialmente em sutiãs e modeladores leves, garantindo caimento e ajuste.",
        material: "Elástico"
    },

    // Viés
    {
        id: 70,
        nome: "Atlas",
        categoria: "Viés",
        imagem: "img - Copia/Viés/atlas-stik (1).png",
        descricao: "Estrutura firme, estabilidade dimensional e bom caimento sem adicionar volume indesejado à peça. Atlas é o viés com estrutura sólida e bom caimento, ideal para o reforço de costuras e contornos em tecidos leves e médios. Proporciona estabilidade técnica ao acabamento, garantindo que seja robusto, elegante e não comprometa a leveza do tecido ou o caimento final do vestuário, sendo de fácil aplicação industrial em grandes volumes e mantendo a uniformidade.",
        material: "Elástico"
    },
    {
        id: 71,
        nome: "Eros",
        categoria: "Viés Com Arco",
        imagem: "img - Copia/Viés/eros-stik (1).png",
        descricao: "Refinamento estético e resistência invisível para um acabamento suave e superior nas peças. Eros é o viés de toque refinado, com acabamento discreto e notável resistência a atrito e desgaste. É excelente para aplicações que exigem durabilidade e uma transição suave, praticamente imperceptível, entre os tecidos, sendo ideal para peças íntimas e de alta-costura que valorizam o conforto e a estética discreta, com alta maleabilidade para encaixes.",
        material: "Elástico"
    },
    {
        id: 72,
        nome: "Nud",
        categoria: "Viés Com Arco",
        imagem: "img - Copia/Viés/nudvies-stik.png",
        descricao: "Conforto extremo e discrição visual para peças que exigem máximo bem-estar e leveza. Nud é o viés com toque suave e alta maleabilidade e adaptabilidade ao corpo em movimento. É ideal para ser usado em acabamentos de peças íntimas, moda praia e vestuário esportivo, onde o conforto na pele e a discrição visual no design são a prioridade absoluta da sua coleção e a resistência ao cloro e umidade é essencial, garantindo um resultado limpo.",
        material: "Elástico"
    },
    {
        id: 73,
        nome: "Senna",
        categoria: "Viés",
        imagem: "img - Copia/Viés/sennavies-stik.png",
        descricao: "A elegância de um reforço que dura, oferece segurança à costura e valoriza o acabamento. Senna é o viés especialmente indicado para o reforço de costuras e bordas, unindo um visual elegante com alta funcionalidade. Sua construção robusta garante que o acabamento resista ao uso contínuo, à tensão e à lavagem sem perder a forma ou a integridade, oferecendo um resultado duradouro e profissional para peças que demandam maior sustentação nas bordas.",
        material: "Elástico"
    },
    {
        id: 74,
        nome: "Sud",
        categoria: "Viés Com Arco",
        imagem: "img - Copia/Viés/sud-stik.png",
        descricao: "Acabamento profissional impecável e adaptável em curvas e contornos complexos do design. Sud é o viés flexível e confiável, perfeito para ser aplicado em áreas com curvas, contornos e encaixes difíceis. Garante um acabamento limpo, profissional e se adapta perfeitamente ao formato da peça, mantendo a forma do design e oferecendo um excelente resultado estético e funcional em larga escala, otimizando o processo de confecção em detalhes arredondados.",
        material: "Elástico"
    },
    {
        id: 75,
        nome: "X Nillo",
        categoria: "Viés",
        imagem: "img - Copia/Viés/xnillovies-stik.png",
        descricao: "Viés versátil com acabamento profissional e resistência para qualquer desafio de design e costura. X Nillo é um produto com alto nível de acabamento e grande versatilidade em sua aplicação em diversos tipos de vestuário. Adapta-se com excelência a diferentes tipos de peças e métodos de costura, assegurando um resultado de alta qualidade, resistência e durabilidade garantida, desde moda íntima a roupas esportivas e de base, sendo um material confiável para bordas e bainhas.",
        material: "Elástico"
    },
    // Novos produtos adicionados - Personalizados (IDs 76 a 79)
    {
        id: 76,
        nome: "Cleide",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/cleide-stik.png",
        descricao: "O equilíbrio perfeito entre suporte estrutural e conforto em uma peça totalmente personalizada para sua marca. Cleide é um elástico customizado com elasticidade cuidadosamente balanceada e uniforme, projetada para oferecer segurança inabalável e bem-estar durante o uso prolongado. É ideal para uso em sutiãs e vestuário que exigem um suporte confiável e um ajuste que se mantenha estável, com a forte e marcante identidade visual da sua marca em evidência no acabamento, garantindo qualidade técnica, estilo e longevidade do design.",
        material: "Elástico"
    },
    {
        id: 77,
        nome: "Dila",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/dila-stik.png",
        descricao: "Personalização macia, toque suave e alta resistência para o desgaste do dia a dia. Dila é o elástico personalizado, macio e extremamente resistente ao desgaste, ao atrito e à fadiga do material, perfeito para peças íntimas de uso contínuo. Apresenta excelente fixação em reguladores, o que garante um ajuste preciso, duradouro e confortável, acompanhando o movimento do corpo sem ceder. É a escolha técnica para quem busca unir conforto suave, alta performance e a exclusividade da sua marca na alça de sustentação.",
        material: "Elástico"
    },
    {
        id: 78,
        nome: "Listras",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/listraspersoanlisada-stik.png",
        descricao: "Seu design listrado exclusivo com a nossa inquestionável qualidade técnica, durabilidade e sofisticação. Este é o elástico totalmente personalizado com um visual listrado diferenciado, moderno e com alta durabilidade de padrão e cor. Ele adiciona um toque de design sofisticado e único aos cós e acabamentos, mantendo o desempenho elástico superior, a resistência e a qualidade esperada da linha premium, garantindo que a peça se destaque pela estética, longevidade do material e excelente retorno elástico.",
        material: "Elástico"
    },
    {
        id: 79,
        nome: "Cintarela",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/cintarelapremium-stik.png",
        descricao: "Modelagem precisa, alta compressão e a identidade da sua marca em destaque e total exclusividade. A versão personalizada do Cintarela garante suporte firme, conforto e um ajuste preciso em modeladores e vestuário de compressão. Sua construção robusta e de alta tecnologia mantém a compressão necessária e a forma da peça por um longo período de tempo, com um toque exclusivo da sua personalização, valorizando a silhueta, o design com excelência e a durabilidade estrutural da roupa.",
        material: "Elástico"
    },
];
let artigos = null;

/**
 * Carrega artigos de forma lazy a partir de um arquivo JSON (crie data/artigos.json).
 * Reduz o tempo de parsing do script principal.
 */
async function loadArtigos() {
    if (artigos) return artigos;
    try {
        const res = await fetch('./artigos.json');

        if (!res.ok) throw new Error('status ' + res.status);
        artigos = await res.json();
        return artigos;
    } catch (err) {
        console.error('Erro ao carregar artigos:', err);
        artigos = [];
        return artigos;
    }
}

// utilitário para adiar inicializações não-críticas
function deferInit(fn) {
    if (typeof fn !== 'function') return;
    if ('requestIdleCallback' in window) {
        requestIdleCallback(fn, { timeout: 800 });
    } else {
        setTimeout(fn, 200);
    }
}

// Funções para carregar e inicializar componentes
async function carregarComponente(id, url, callback) {
    const placeholder = document.getElementById(id);
    if (!placeholder) return;

    try {
        const response = await fetch(url);
        const html = await response.text();
        placeholder.innerHTML = html;
        
        if (callback && typeof callback === 'function') {
            callback();
        }
    } catch (error) {
        console.error(`Erro ao carregar o componente ${url}:`, error);
    }
}

async function carregarConteudoPrincipal(url) {
    const mainContentPlaceholder = document.getElementById('main-content-placeholder');
    if (!mainContentPlaceholder) return;

    try {
        const response = await fetch(url);
        const html = await response.text();
        mainContentPlaceholder.innerHTML = html;

        history.pushState(null, '', url);
        
        if (url.includes('blog.html')) {
            displayArticles();
            const createBtn = document.getElementById('create-article-btn');
            if (createBtn) {
                createBtn.addEventListener('click', createNewArticle);
            }
        } else if (url.includes('produto.html')) {
            carregarDetalhesDoProduto();
        } 
        inicializarAnimateOnScroll();
        inicializarNewsletterCarousel();

    } catch (error) {
        console.error(`Erro ao carregar o conteúdo ${url}:`, error);
    }
}

// --- Funções de persistência unificadas ---
function saveSidebarState() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    localStorage.setItem('sidebarActive', sidebar.classList.contains('active'));

    const submenusAtivos = [];
    document.querySelectorAll('.submenu, .submenu-aninhado, .submenu-terceiro-nivel').forEach((submenu, index) => {
        if (submenu.classList.contains('active')) {
            submenusAtivos.push(index);
        }
    });
    localStorage.setItem('submenusAtivos', JSON.stringify(submenusAtivos));
}

function restoreSidebarState() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const sidebarActive = localStorage.getItem('sidebarActive') === 'true';
    const overlay = document.getElementById('overlay');

    if (sidebarActive) {
        sidebar.classList.add('active');
        document.body.classList.add('sidebar-open');

        // só bloqueia scroll e mostra overlay em telas pequenas
        if (window.matchMedia('(max-width: 768px)').matches) {
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    } else {
        sidebar.classList.remove('active');
        document.body.classList.remove('sidebar-open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    const submenusAtivos = JSON.parse(localStorage.getItem('submenusAtivos')) || [];
    document.querySelectorAll('.submenu, .submenu-aninhado, .submenu-terceiro-nivel').forEach((submenu, index) => {
        if (submenusAtivos.includes(index)) submenu.classList.add('active');
        else submenu.classList.remove('active');
    });

    // sincroniza ícones de chevron
    document.querySelectorAll('.has-submenu > .sidebar-link, .has-submenu-hover > .sidebar-link, .has-submenu > a, .has-submenu-hover > a').forEach(trigger => {
        const submenu = trigger.nextElementSibling;
        const icon = trigger.querySelector('.fas.fa-chevron-down, .fas.fa-chevron-right');
        if (submenu?.classList.contains('active') && icon) {
            if (icon.classList.contains('fa-chevron-down')) icon.classList.add('fa-rotate-180');
            else icon.classList.add('fa-rotate-90');
        } else if (icon) {
            icon.classList.remove('fa-rotate-180', 'fa-rotate-90');
        }
    });
}
// ------------------------------------------

function inicializarMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const closeSidebar = document.querySelector('.close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    // aceita tanto <a> como .sidebar-link, pra cobrir estruturas diferentes
    const submenuLinks = document.querySelectorAll('.has-submenu > .sidebar-link, .has-submenu-hover > .sidebar-link, .has-submenu > a, .has-submenu-hover > a');
    const allLinks = document.querySelectorAll('.sidebar-nav a');

    if (!sidebar) return;

    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    // abre a sidebar (usa overlay somente no mobile)
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            document.body.classList.add('sidebar-open'); // <-- importante para empurrar conteúdo

            if (overlay) {
                if (isMobile()) {
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden'; // bloqueia scroll só no mobile
                } else {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }

            saveSidebarState();
        });
    }

    // fecha a sidebar (limpa localStorage e estado)
    const closeSidebarFn = () => {
        sidebar.classList.remove('active');
        document.body.classList.remove('sidebar-open');

        if (overlay) overlay.classList.remove('active');

        document.body.style.overflow = '';

        // limpa o estado salvo (o usuário fechou manualmente)
        localStorage.removeItem('sidebarActive');
        localStorage.removeItem('submenusAtivos');

        // remove classes visuais
        document.querySelectorAll('.submenu.active, .submenu-aninhado.active, .submenu-terceiro-nivel.active').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.fa-rotate-180, .fa-rotate-90').forEach(ic => ic.classList.remove('fa-rotate-180', 'fa-rotate-90'));
    };

    if (closeSidebar) closeSidebar.addEventListener('click', closeSidebarFn);
    if (overlay) overlay.addEventListener('click', closeSidebarFn);

    // abrir/fechar submenus (só previne o link se realmente houver submenu)
    submenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const submenu = link.nextElementSibling;
            if (!submenu) return; // se não tiver submenu, segue o link normalmente

            // evita navegação do link pai (se for '#') e alterna submenu
            e.preventDefault();

            submenu.classList.toggle('active');

            const icon = link.querySelector('.fas.fa-chevron-down, .fas.fa-chevron-right');
            if (icon) {
                if (icon.classList.contains('fa-chevron-down')) {
                    icon.classList.toggle('fa-rotate-180');
                } else {
                    icon.classList.toggle('fa-rotate-90');
                }
            }

            saveSidebarState();
        });
    });

    // salva estado ao clicar em qualquer link (útil para navegação)
    allLinks.forEach(link => {
        link.addEventListener('click', () => {
            saveSidebarState();
        });
    });

    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.querySelector('.menu-toggle');

        if (sidebar && menuToggle && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            if (sidebar.classList.contains('active')){
                closeSidebarFn();
            }
        }
    })

    // também re-ativa o comportamento ao redimensionar (ex.: abrir no desktop, reduzir para mobile)
    window.addEventListener('resize', () => {
        // se a sidebar está aberta e o usuário redimensionou para desktop, garante overflow correto
        if (sidebar.classList.contains('active')) {
            if (!isMobile()) {
                document.body.style.overflow = '';
                if (overlay) overlay.classList.remove('active');
            } else {
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    });
}



// Funções para a página inicial
// Helpers de apresentação
function normalizeCategoria(cat) {
    const map = { 'Alças': 'Alça', 'Bases': 'Base' };
    return map[cat] || cat;
}

function formatNome(nome) {
    if (!nome) return '';
    return nome.replace(/\b\p{L}/gu, (m) => m.toUpperCase());
}

function criarProdutoCard(produto) {
    const produtoCard = document.createElement('a'); 
    produtoCard.classList.add('produto-card');
    produtoCard.href = `produto.html?id=${produto.id}`;
    const src = encodeURI(produto.imagem);
    produtoCard.innerHTML = `
        <img src="${src}" alt="${normalizeCategoria(produto.categoria)}">
        <h3>${normalizeCategoria(produto.categoria)}</h3>
    `;
    return produtoCard;
}

function criarCategoriaCard(categoria, imagemRepresentativa) {
    const card = document.createElement('a');
    card.classList.add('produto-card');
    card.href = `categoria.html?categoria=${encodeURIComponent(categoria)}`;
    const src = encodeURI(imagemRepresentativa);
    card.innerHTML = `
        <img src="${src}" alt="${categoria}">
        <h3>${categoria}</h3>
    `;
    return card;
}

function exibirCategorias(produtosParaExibir) {
    const listaProdutosContainer = document.getElementById('lista-produtos');
    if (!listaProdutosContainer) return;
    listaProdutosContainer.innerHTML = '';

    if (!Array.isArray(produtosParaExibir) || produtosParaExibir.length === 0) {
        listaProdutosContainer.innerHTML = '<p class="no-results">Nenhum produto encontrado.</p>';
        return;
    }

    // Agrupa por categoria normalizada e pega o primeiro item como imagem representativa
    const porCategoria = new Map();
    produtosParaExibir.forEach(p => {
        const cat = normalizeCategoria(p.categoria);
        if (!porCategoria.has(cat)) porCategoria.set(cat, p);
    });

    porCategoria.forEach((produtoRepresentativo, cat) => {
        const card = criarCategoriaCard(cat, produtoRepresentativo.imagem);
        listaProdutosContainer.appendChild(card);
    });
}

// Lógica de pesquisa
function inicializarPesquisa() {
    const searchToggle = document.querySelector('.search-toggle');
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.getElementById('searchInput');
    const searchResultsList = document.getElementById('searchResultsList');

    if (!searchToggle || !searchBox || !searchInput || !searchResultsList) {
        console.error("Um ou mais elementos de pesquisa não foram encontrados.");
        return;
    }

    // Toggle abre/fecha caixa de pesquisa
    searchToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const header = document.getElementById('mainHeader') || document.querySelector('.top-header');
        const opening = !searchBox.classList.contains('is-active');
        searchBox.classList.toggle('is-active');
        if (opening) {
            if (header) header.classList.add('search-open');
            searchInput.focus();
        } else {
            if (header) header.classList.remove('search-open');
            limparPesquisa();
        }
    });

    // Busca em tempo real
    searchInput.addEventListener('input', (e) => {
        const termoBusca = e.target.value.toLowerCase()
            .normalize("NFD") // Normaliza a string para decompor os caracteres
            .replace(/[\u0300-\u036f]/g, ""); // Remove os diacríticos (acentos)

        searchResultsList.innerHTML = '';

        if (termoBusca.length > 1) {
            const produtosFiltrados = produtos.filter(produto => {
                // Normaliza e remove acentos dos nomes e categorias dos produtos
                const nomeNormalizado = produto.nome.toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");
                const categoriaNormalizada = normalizeCategoria(produto.categoria).toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");

                return nomeNormalizado.includes(termoBusca) || categoriaNormalizada.includes(termoBusca);
            });

            if (produtosFiltrados.length > 0) {
                produtosFiltrados.forEach(produto => {
                    const item = document.createElement('a');
                    item.href = `produto.html?id=${produto.id}`;
                    item.classList.add('search-result-item');
                    const src = encodeURI(produto.imagem);
                    item.innerHTML = `
                        <img src="${src}" alt="${formatNome(produto.nome)}" />
                        <span>${formatNome(produto.nome)} <small>(${normalizeCategoria(produto.categoria)})</small></span>
                    `;
                    searchResultsList.appendChild(item);
                });
                searchBox.classList.add('has-results');
            } else {
                searchBox.classList.remove('has-results');
                searchResultsList.innerHTML = '<p class="no-results-msg">Nenhum resultado encontrado.</p>';
            }
        } else {
            searchResultsList.innerHTML = '';
            searchBox.classList.remove('has-results');
        }
    });

    // Fecha a pesquisa ao clicar fora
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target) && !searchToggle.contains(e.target)) {
            const header = document.getElementById('mainHeader') || document.querySelector('.top-header');
            searchBox.classList.remove('is-active');
            if (header) header.classList.remove('search-open');
            limparPesquisa();
        }
    });

    function limparPesquisa() {
        searchResultsList.innerHTML = '';
        searchInput.value = '';
        searchBox.classList.remove('has-results');
        const header = document.getElementById('mainHeader') || document.querySelector('.top-header');
        if (header) header.classList.remove('search-open');
    }
}

function setupDraggableCarousel(carouselElement) {
    if (!carouselElement) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    
    const startDrag = (e) => {
        isDown = true;
        carouselElement.classList.add('active');
        startX = (e.pageX || e.touches[0].pageX);
        scrollLeft = carouselElement.scrollLeft;
    };

    const endDrag = () => {
        isDown = false;
        carouselElement.classList.remove('active');
    };

    const drag = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = (e.pageX || e.touches[0].pageX);
        const walk = x - startX;
        carouselElement.scrollLeft = scrollLeft - walk;
    };
    
    carouselElement.addEventListener('mousedown', startDrag);
    carouselElement.addEventListener('mouseleave', endDrag);
    carouselElement.addEventListener('mouseup', endDrag);
    carouselElement.addEventListener('mousemove', drag);
    
    carouselElement.addEventListener('touchstart', startDrag, { passive: true });
    carouselElement.addEventListener('touchend', endDrag);
    carouselElement.addEventListener('touchcancel', endDrag);
    carouselElement.addEventListener('touchmove', drag, { passive: false });
}

function initBannerCarousel() {
    const bannerImages = [
        { src: "./img/banner/banner-site-8_Prancheta-1-scaled (1).jpg", alt: 'Elásticos para a sua confecção de moda fitness' },
        { src: "./img/banner/banner-site-10_Prancheta-1-scaled.jpg", alt: 'Renda-se aos nossos encantos!' },
        { src: "./img/banner/banner-site-11_Prancheta-1-scaled.jpg", alt: 'Catálogo Virtual' },
    ];
    
    const mainBannerTrack = document.getElementById('mainBannerTrack');
    const bannerPrevBtn = document.getElementById('bannerPrevBtn');
    const bannerNextBtn = document.getElementById('bannerNextBtn');

    if (!mainBannerTrack) return;

    bannerImages.forEach(img => {
        const item = document.createElement('div');
        item.classList.add('carousel-item');
        item.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
        mainBannerTrack.appendChild(item);
    });

    let currentIndex = 0;
    const totalItems = bannerImages.length;
    
    function moveToSlide(index) {
        if (index < 0) {
            index = totalItems - 1;
        } else if (index >= totalItems) {
            index = 0;
        }
        mainBannerTrack.style.transform = `translateX(-${index * 100}%)`;
        currentIndex = index;
    }

    if (bannerNextBtn) {
        bannerNextBtn.addEventListener('click', () => moveToSlide(currentIndex + 1));
    }
    if (bannerPrevBtn) {
        bannerPrevBtn.addEventListener('click', () => moveToSlide(currentIndex - 1));
    }
    
    setInterval(() => {
        moveToSlide(currentIndex + 1);
    }, 5000);
    
    setupDraggableCarousel(mainBannerTrack);
}

// --- Micro interactions: parallax, staggered reveal and subtle tilt ---
function initMicroInteractions() {
    // parallax on hero (based on mouse move) - subtle
    const hero = document.querySelector('.video-hero-section');
    if (hero) {
        hero.classList.add('video-hero-inner');
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            const layers = hero.querySelectorAll('img, video');
            layers.forEach(el => {
                const depth = 10; // a bit stronger
                const tx = px * depth;
                const ty = py * depth;
                el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.02)`;
            });
        });
        hero.addEventListener('mouseleave', () => {
            hero.querySelectorAll('img, video').forEach(el => el.style.transform = 'translate3d(0,0,0) scale(1)');
        });
    }

    // staggered reveal for highlight items on scroll (small delay between them)
    const highlights = document.querySelectorAll('.highlight-item');
    if (highlights.length) {
        highlights.forEach((item, idx) => {
            item.classList.add('staggered');
            // when in viewport, add class 'in' with a delay
            const io = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => item.classList.add('in'), idx * 110);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.18 });
            io.observe(item);
        });
    }

    // subtle tilt on produto cards
    const produtoCards = document.querySelectorAll('.produto-card, .article-card');
    produtoCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width/2;
            const cy = rect.top + rect.height/2;
            const dx = (e.clientX - cx) / rect.width;
            const dy = (e.clientY - cy) / rect.height;
            const rotX = (dy * 8).toFixed(2);
            const rotY = (-dx * 8).toFixed(2);
            card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // newsletter carousel images parallax
    const carousel = document.querySelector('.carousel-bg .carousel-track');
    if (carousel) {
        carousel.addEventListener('mousemove', (e) => {
            const rect = carousel.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            carousel.querySelectorAll('img').forEach((img, idx) => {
                const depth = 8 + (idx % 3); // small variance
                const tx = px * depth;
                const ty = py * depth * 0.6;
                img.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.03)`;
                img.style.filter = `brightness(${1 - Math.abs(px) * 0.08})`;
            });
        });
        carousel.addEventListener('mouseleave', () => {
            carousel.querySelectorAll('img').forEach(img => {
                img.style.transform = '';
                img.style.filter = '';
            });
        });
    }
}


function createNewArticle() {
    window.location.href = 'create-article.html';
}

function createArticleCard(article) {
    const card = document.createElement('a');
    card.href = `article.html?id=${article.id}`;
    card.classList.add('article-card');

    const firstImage = article.content.match(/<img[^>]+src="([^">]+)"/);
    const imageUrl = firstImage ? firstImage[1] : './img/default-blog.png';
    
    const contentWithoutHtml = new DOMParser().parseFromString(article.content, 'text/html').body.textContent;
    const trimmedContent = contentWithoutHtml.length > 150 ? contentWithoutHtml.substring(0, 150) + '...' : contentWithoutHtml;
    
    card.innerHTML = `
    <img src="${imageUrl}" alt="${article.title}">
    <div class="article-card-content">
            <h2>${article.title}</h2>
            <p>${trimmedContent}</p>
        </div>
    `;
    return card;
}


async function displayArticles() {
    const container = document.getElementById('artigos-container');
    if (!container) return;

    // carrega só quando necessário
    const lista = await loadArtigos();

    // limpa rapidamente sem forçar reflow por cada append
    container.innerHTML = '';

    if (!lista || lista.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhum artigo encontrado.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    lista.forEach(artigo => {
        const articleEl = document.createElement('article');
        articleEl.className = 'blog-post';

        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'post-thumb';
        const linkThumb = document.createElement('a');
        linkThumb.href = `artigo.html?id=${artigo.id}`;
        const img = document.createElement('img');
        img.src = artigo.imagem;
        img.alt = artigo.titulo;
        img.loading = 'lazy';
        img.decoding = 'async';
        linkThumb.appendChild(img);
        thumbDiv.appendChild(linkThumb);

        const metaDiv = document.createElement('div');
        metaDiv.className = 'post-meta';
        metaDiv.innerHTML = `<span><i class="fas fa-user"></i> ${artigo.autor}</span>
                             <span><i class="fas fa-calendar-alt"></i> ${artigo.data}</span>`;

        const titleH2 = document.createElement('h2');
        titleH2.className = 'post-title';
        titleH2.innerHTML = `<a href="artigo.html?id=${artigo.id}">${artigo.titulo}</a>`;

        const excerptP = document.createElement('p');
        excerptP.className = 'post-excerpt';
        excerptP.textContent = artigo.resumo;

        const readMore = document.createElement('a');
        readMore.className = 'read-more';
        readMore.href = `artigo.html?id=${artigo.id}`;
        readMore.innerHTML = 'Read more <i class="fas fa-arrow-right"></i>';

        articleEl.appendChild(thumbDiv);
        articleEl.appendChild(metaDiv);
        articleEl.appendChild(titleH2);
        articleEl.appendChild(excerptP);
        articleEl.appendChild(readMore);

        fragment.appendChild(articleEl);
    });

    container.appendChild(fragment);
}


async function carregarArtigo() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    // garante dados carregados
    await loadArtigos();

    const artigo = (artigos || []).find(a => a.id === id);

    const articleTitleEl = document.getElementById('article-title');
    const articleMetaEl = document.getElementById('article-meta');
    const articleImageEl = document.getElementById('article-image');
    const articleContentEl = document.getElementById('article-content');

    if (!artigo) {
        if (articleContentEl) articleContentEl.innerHTML = "<h2>Artigo não encontrado.</h2>";
        return;
    }

    if (articleTitleEl) articleTitleEl.textContent = artigo.titulo;
    if (articleMetaEl) articleMetaEl.innerHTML = `Publicado por <span>${artigo.autor}</span> em ${artigo.data}`;
    if (articleImageEl) {
        articleImageEl.setAttribute('loading', 'lazy');
        articleImageEl.decoding = 'async';
        articleImageEl.src = artigo.imagem;
        articleImageEl.alt = artigo.titulo;
        // tentar decodificar sem bloquear
        if (articleImageEl.decode) articleImageEl.decode().catch(()=>{/* ignore */});
    }
    if (articleContentEl) articleContentEl.innerHTML = artigo.conteudoCompleto;

    // adia inits pesados de visibilidade/animations
    deferInit(() => {
        if (typeof inicializarAnimateOnScroll === 'function') inicializarAnimateOnScroll();
    });
}

function setupArticleForm() {
    const form = document.getElementById('article-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const titleInput = document.getElementById('article-title');
        const contentInput = document.getElementById('article-content');
        
        if (!titleInput.value || !contentInput.value) {
            alert('Por favor, preencha o título e o conteúdo.');
            return;
        }
        
        const newArticle = {
            id: Date.now(),
            title: titleInput.value,
            content: contentInput.value,
            date: new Date().toISOString()
        };
        
        const articles = JSON.parse(localStorage.getItem('blogArticles')) || [];
        articles.push(newArticle);
        localStorage.setItem('blogArticles', JSON.stringify(articles));
        
        alert('Artigo salvo com sucesso!');
        window.location.href = 'blog.html';
    });
}

function carregarDetalhesDoProduto() {
    const params = new URLSearchParams(window.location.search);
    const produtoId = parseInt(params.get('id'));
    const produto = produtos.find(p => p.id === produtoId);

    if (produto) {
        document.getElementById('main-product-image').src = encodeURI(produto.imagem);
        document.querySelector('.product-name').textContent = formatNome(produto.nome);

        // Subtítulo = primeira frase da descrição
        const extrairPrimeiraFrase = (texto) => {
            if (!texto) return { primeira: '', resto: '' };
            const m = texto.match(/^[^.!?]+[.!?]/);
            if (m) {
                const primeira = m[0].trim();
                const resto = texto.slice(m[0].length).trim();
                return { primeira, resto };
            }
            return { primeira: texto.trim(), resto: '' };
        };

        const { primeira, resto } = extrairPrimeiraFrase(produto.descricao || '');
        const subEl = document.querySelector('.product-subtitle');
        if (subEl) subEl.textContent = primeira;

        // Descrição em parágrafos (quebra por sentenças e agrupa em blocos de 1-2 sentenças)
        const toParagraphs = (texto) => {
            if (!texto) return [];
            const sentencas = texto.split(/(?<=[.!?])\s+/).filter(Boolean);
            const paragrafos = [];
            for (let i = 0; i < sentencas.length; i += 2) {
                paragrafos.push(sentencas.slice(i, i + 2).join(' '));
            }
            return paragrafos;
        };

        const descEl = document.querySelector('.product-description-modern');
        if (descEl) {
            descEl.innerHTML = '';
            const paragrafos = toParagraphs(resto);
            if (paragrafos.length === 0 && primeira) {
                // Se não houver resto, cria um parágrafo com a descrição completa (fallback)
                paragrafos.push(resto || produto.descricao);
            }
            paragrafos.forEach(txt => {
                const p = document.createElement('p');
                p.textContent = txt;
                descEl.appendChild(p);
            });
        }

        // Linha meta (Material | Categoria)
        const metaEl = document.querySelector('.product-meta');
        if (metaEl) metaEl.innerHTML = `Material: ${produto.material} &nbsp;|&nbsp; Categoria: ${normalizeCategoria(produto.categoria)}`;

        // Renderiza cards 'Veja também' (produtos da mesma categoria, exceto o atual)
        const grid = document.querySelector('.veja-tambem-grid');
        if (grid) {
            grid.innerHTML = '';
            const outros = produtos.filter(p => normalizeCategoria(p.categoria) === normalizeCategoria(produto.categoria) && p.id !== produto.id);
            outros.slice(0, 3).forEach(p => {
                const card = document.createElement('a');
                card.classList.add('produto-card');
                card.href = `produto.html?id=${p.id}`;
                card.innerHTML = `<img src="${encodeURI(p.imagem)}" alt="${formatNome(p.nome)}"><h3>${formatNome(p.nome)}</h3>`;
                grid.appendChild(card);
            });
        }

        const variationOptions = document.querySelector('.variation-options');
        if (variationOptions) {
            variationOptions.innerHTML = '';
        }
    } else {
        console.error("Produto não encontrado.");
    }
}

function inicializarNewsletterCarousel() {
    const placeholder = document.getElementById('catalogo-placeholder');
    if (!placeholder) return;

    fetch('catalogo.html')
        .then(response => response.text())
        .then(html => {
            placeholder.innerHTML = html; 
            inicializarAnimateOnScroll();
            // re-bind do form do catálogo quando o HTML for injetado
            bindCatalogForm();
        })
        .catch(error => console.error('Erro ao carregar catálogo:', error));
}

// Bind do formulário que envia o catálogo via backend
function bindCatalogForm() {
    const form = document.getElementById('catalog-form');
    const input = document.getElementById('catalog-email');
    const feedback = document.getElementById('catalog-feedback');
    if (!form || !input || !feedback) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = input.value.trim();
        const consentCheckbox = document.getElementById('catalog-consent');
        const consent = !!(consentCheckbox && consentCheckbox.checked);
        feedback.style.color = '#fff';
        if (!email) {
            feedback.textContent = 'Por favor digite um e-mail válido.';
            return;
        }
        if (!consent) {
            feedback.textContent = 'Por favor aceite receber comunicações marcando a caixa de consentimento.';
            return;
        }

        feedback.textContent = 'Enviando catálogo...';
        try {
            // tenta obter token reCAPTCHA se o widget estiver disponível
            let recaptchaToken = null;
            if (window.grecaptcha && window.RECAPTCHA_SITE_KEY) {
                try {
                    recaptchaToken = await window.grecaptcha.execute(window.RECAPTCHA_SITE_KEY, { action: 'send_catalog' });
                } catch (err) {
                    console.warn('Falha ao executar grecaptcha:', err);
                }
            }

            const payload = { email, consent };
            if (recaptchaToken) payload.recaptchaToken = recaptchaToken;

            const res = await fetch('/api/send-catalog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                feedback.style.color = '#b3ffd9';
                feedback.textContent = data.message || 'Catálogo enviado! Verifique seu e-mail.';
                input.value = '';
            } else {
                const err = await res.json().catch(()=>({ message: 'Erro desconhecido' }));
                feedback.style.color = '#ffd1d1';
                feedback.textContent = err.message || 'Falha ao enviar. Tente novamente mais tarde.';
            }
        } catch (error) {
            console.error('Erro ao chamar API local:', error);
            feedback.style.color = '#ffd1d1';
            feedback.textContent = 'Erro de conexão. Tente novamente.';
        }
    });
}

function inicializarAnimateOnScroll() {
    const elementosAnimar = document.querySelectorAll('.animate-on-scroll');
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elementosAnimar.forEach(elemento => observer.observe(elemento));
}

function inicializarHeaderIndex() {
    const topHeader = document.getElementById('mainHeader');
    const videoHeroSection = document.querySelector('.video-hero-section');
    const headerHoverArea = document.getElementById('header-hover-area');
    
    if (!topHeader || !videoHeroSection || !headerHoverArea) {
        return;
    }

    const videoHeroHeight = videoHeroSection.clientHeight;

    const showHeader = () => {
        topHeader.classList.remove('is-hidden');
        topHeader.classList.add('is-visible');
    };

    const hideHeader = () => {
        topHeader.classList.remove('is-visible');
        topHeader.classList.add('is-hidden');
    };

    const updateHeaderOnScroll = () => {
        if (window.scrollY > (videoHeroHeight - 100)) {
            showHeader();
            topHeader.classList.add('scrolled');
        } else {
            topHeader.classList.remove('scrolled');
            if (!headerHoverArea.matches(':hover')) {
                hideHeader();
            }
        }
    };

    headerHoverArea.addEventListener('mouseenter', showHeader);

    window.addEventListener('scroll', updateHeaderOnScroll);

    updateHeaderOnScroll();
}

function inicializarHeaderPaginaSecundaria() {
    const topHeader = document.getElementById('mainHeader');
    if (topHeader) {
        topHeader.classList.add('is-visible', 'scrolled');
        topHeader.classList.remove('is-hidden');
    }
}


function inicializarPaginaFaq() {
    console.log("Página FAQ inicializada.");
}

function inicializarPaginaPolitica() {
    console.log("Página de Política de Privacidade inicializada.");
}

function inicializarPaginaTermos() {
    console.log("Página de Termos de Uso inicializada.");
}

function inicializarPaginaFaleConosco() {
    console.log("Página Fale Conosco inicializada.");
}

function inicializarModoClaro() {
    const themeToggleButton = document.querySelector('.icon-btn[aria-label="Modo Claro/Escuro"]');
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light-mode') {
        document.body.classList.add('light-mode');
        const icon = themeToggleButton.querySelector('i');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            
            const icon = themeToggleButton.querySelector('i');
            
            if (document.body.classList.contains('light-mode')) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light-mode');
            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark-mode');
            }
        });
    }
}

// Função principal de inicialização da página
async function inicializarPagina() {
    // A função de pesquisa será chamada dentro do callback do carregamento do header
    await carregarComponente('header-placeholder', 'header.html', inicializarPesquisa);
    
    // ATENÇÃO: A RESTAURAÇÃO DO ESTADO SÓ OCORRE AQUI DENTRO, APÓS O CARREGAMENTO DA SIDEBAR
    await carregarComponente('sidebar-placeholder', 'sidebar.html', () => {
        inicializarMenu();
        restoreSidebarState();
    });
    
    await carregarComponente('footer-placeholder', 'footer.html');
    
    deferInit(() => {
        inicializarNewsletterCarousel();
        inicializarModoClaro();
        initRecaptcha();
    });
        
    
    const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    const isCategoryPage = window.location.pathname.includes('categoria.html');
    const isProductPage = window.location.pathname.includes('produto.html');
    const isBlogPage = window.location.pathname.includes('blog.html');
    const isArticlePage = window.location.pathname.includes('artigo.html');
    const isCreateArticlePage = window.location.pathname.includes('create-article.html');
    const isFaqPage = window.location.pathname.includes('faq.html');
    const isPoliticaPage = window.location.pathname.includes('politica_de_privacidade.html');
    const isTermosPage = window.location.pathname.includes('termos_de_uso.html');
    const isFaleConoscoPage = window.location.pathname.includes('fale_conosco.html');
    

    if (isIndexPage) {
        inicializarHeaderIndex();
        exibirCategorias(produtos);
        initBannerCarousel();
        setupDraggableCarousel(document.getElementById('lista-produtos'));
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const catalogoGrid = document.getElementById('lista-produtos');
        if (prevBtn && nextBtn && catalogoGrid) {
            const scrollStep = 300;
            nextBtn.addEventListener('click', () => catalogoGrid.scrollLeft += scrollStep);
            prevBtn.addEventListener('click', () => catalogoGrid.scrollLeft -= scrollStep);
        }
    } else {
        inicializarHeaderPaginaSecundaria();
    }
    
    if (isProductPage) {
        carregarDetalhesDoProduto();
        inicializarNewsletterCarousel();
        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get('id'), 10);

        const produto = produtos.find(p => p.id === id);
        if (!produto) {
            document.body.innerHTML = "<p>Produto não encontrado.</p>";
            return;
        }

        document.getElementById('main-product-image').src = encodeURI(produto.imagem);
        document.querySelector('.product-name').textContent = formatNome(produto.nome);
        document.querySelector('.product-description').textContent = produto.descricao;
        document.querySelector('.product-material').textContent = produto.material;
        document.querySelector('.product-categoria').textContent = normalizeCategoria(produto.categoria);
    } else if (isBlogPage) {
        displayArticles();
        // -------------------- Botão de cadastrar artigo -----------------------------
        // const createBtn = document.getElementById('create-article-btn');
        // if (createBtn) {
        //     createBtn.addEventListener('click', createNewArticle);
        // }
    } else if (isArticlePage) {
        carregarArtigo();
    } else if (isCreateArticlePage) {
        setupArticleForm();
    } else if (isFaqPage) {
        inicializarPaginaFaq();
    } else if (isPoliticaPage) {
        inicializarPaginaPolitica();
    } else if (isTermosPage) {
        inicializarPaginaTermos();
    } else if (isFaleConoscoPage) {
            inicializarPaginaFaleConosco();
    } else if (isCategoryPage) {
        renderCategoriaPage();
    }

    const linkIntitucional = document.getElementById('link-institucional');
    if (linkIntitucional) {
        linkIntitucional.addEventListener('click', (event) => {
            event.preventDefault();
            carregarComponente('main-content-placeholder', 'institucional.html');
        });
    }
    
    inicializarAnimateOnScroll();
}


async function getRecaptchaToken(action = 'contact', timeout = 6000) {
  if (!window.RECAPTCHA_SITE_KEY) return null;
  const start = Date.now();
  while (!window.grecaptcha) {
    if (Date.now() - start > timeout) return null;
    await new Promise(r => setTimeout(r, 150));
  }
  try {
    await new Promise(resolve => window.grecaptcha.ready(resolve));
    const token = await window.grecaptcha.execute(window.RECAPTCHA_SITE_KEY, { action });
    return token || null;
  } catch (err) {
    console.warn('getRecaptchaToken falhou:', err);
    return null;
  }
}

// Bind para o formulário "Fale Conosco"
function bindContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  // cria feedback se não houver
  let feedback = document.getElementById('contact-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'contact-feedback';
    feedback.style.marginTop = '10px';
    form.appendChild(feedback);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#message');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    feedback.style.color = '';
    if (!name || !email || !message) {
      feedback.textContent = 'Por favor preencha nome, e-mail e mensagem.';
      feedback.style.color = 'red';
      return;
    }

    feedback.textContent = 'Enviando mensagem...';

    try {
      // tenta obter token reCAPTCHA se disponível
      let recaptchaToken = null;
      if (window.RECAPTCHA_SITE_KEY) {
        recaptchaToken = await getRecaptchaToken('contact', 6000);
        if (!recaptchaToken) console.warn('recaptchaToken não obtido para contact');
      }

      const payload = { name, email, message };
      if (recaptchaToken) payload.recaptchaToken = recaptchaToken;

      const res = await fetch('/api/send-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        feedback.style.color = '#b3ffd9';
        feedback.textContent = data.message || 'Mensagem enviada com sucesso.';
        form.reset();
      } else {
        feedback.style.color = '#ffd1d1';
        feedback.textContent = data.message || 'Erro ao enviar. Tente novamente mais tarde.';
        console.warn('send-contact erro:', res.status, data);
      }
    } catch (err) {
      console.error('Erro ao chamar /api/send-contact:', err);
      feedback.style.color = '#ffd1d1';
      feedback.textContent = 'Erro de conexão. Tente novamente.';
    }
  });
}

// chama bindContactForm quando inicializa a página de "Fale Conosco"
function inicializarPaginaFaleConosco() {
  console.log("Página Fale Conosco inicializada.");
  bindContactForm();
}


// Inicializa reCAPTCHA v3 se a site key estiver disponível via /api/config
async function initRecaptcha() {
    try {
        const res = await fetch('/api/config');
        const cfg = await res.json();
        if (cfg && cfg.recaptchaSiteKey) {
            window.RECAPTCHA_SITE_KEY = cfg.recaptchaSiteKey;
            // injeta o script do Google reCAPTCHA v3
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=${cfg.recaptchaSiteKey}`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
            // garante que grecaptcha esteja pronto: chamamos grecaptcha.ready antes de usar
            script.addEventListener('load', () => {
                console.log('reCAPTCHA script carregado');
            });
        }
    } catch (err) {
        console.warn('Não foi possível inicializar reCAPTCHA:', err);
    }
}

(function handleNewsletterSidebarLinks() {
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href="#newsletter"]');
    if (!link) return;

    e.preventDefault();

    const target = document.getElementById('newsletter');
    if (target) {
      // rolar suavemente até a seção existente e atualizar o hash sem pular
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try {
        history.replaceState(null, '', '#newsletter');
      } catch (err) { /* ignore */ }
    } else {
      // não existe na página atual -> redireciona para index.html#newsletter
      // ajuste o caminho se seu index estiver em outra rota
      window.location.href = 'index.html#newsletter';
    }
  }, false);
})();


// ...existing code...

/**
 * Scroll suave avançado: mantém a velocidade inicial do scroll,
 * mas suaviza a desaceleração no final, para uma sensação mais natural.
 * Chame esta função para rolar até targetY (em px) com duração e easing customizados.
 */
function scrollToTargetEasingCustom(targetY, duration = 200, easing = 'easeInOutCubic') {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    const easings = {
        linear: t => t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => 1 - Math.pow(1 - t, 3),
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    };

    const easeFn = easings[easing] || easings.easeInOutCubic;

    function animate(now) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = easeFn(t);
        window.scrollTo(0, startY + distance * eased);
        if (t < 1) {
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
}

// Aplica o scroll suave em todos os links âncora internos (ex: <a href="#secao">)
document.addEventListener('DOMContentLoaded', async () => {
    await inicializarPagina();

    // ativa micro-interações depois que a página foi inicializada
    try { initMicroInteractions(); } catch (e) { console.warn('initMicroInteractions falhou:', e); }

    document.querySelectorAll("a[href^='#']:not([href='#'])").forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                // Calcula a posição do topo do elemento
                const rect = target.getBoundingClientRect();
                const targetY = rect.top + window.scrollY;
                scrollToTargetEasingCustom(targetY, 200, 'easeInOutCubic');
                // Atualiza o hash na URL sem pular
                history.replaceState(null, '', `#${targetId}`);
            }
        });
    });
});

// ...existing code...

// ---------- Funções de cookies e geolocalização (adicionadas) ----------

function setCookie(name, value, days = 30) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts.slice(1).join('=')) : r;
    }, null);
}

async function reverseGeocode(lat, lon) {
    try {
        // Use Nominatim (OpenStreetMap) para reverse geocoding sem chave
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'StikSite/1.0 (contact@stik.com)' } });
        if (!res.ok) throw new Error('status ' + res.status);
        const data = await res.json();
        const city = data.address.city || data.address.town || data.address.village || data.address.county || null;
        const state = data.address.state || data.address.region || null;
        return { city, state, raw: data };
    } catch (err) {
        console.warn('reverseGeocode falhou:', err);
        return { city: null, state: null, raw: null };
    }
}

async function collectLocation() {
    // retorna {lat, lon, city, state}
    // primeiro tenta cookies/localStorage
    const cached = getCookie('stik_location');
    if (cached) {
        try { return JSON.parse(cached); } catch(e) { /* ignore */ }
    }

    // tenta geolocation do browser
    if (!('geolocation' in navigator)) {
        return { lat: null, lon: null, city: null, state: null };
    }

    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            // timeout -> retorna vazio
            resolve({ lat: null, lon: null, city: null, state: null });
        }, 10000);

        navigator.geolocation.getCurrentPosition(async (pos) => {
            clearTimeout(timer);
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const geo = await reverseGeocode(lat, lon);
            const payload = { lat, lon, city: geo.city, state: geo.state };
            try { setCookie('stik_location', JSON.stringify(payload), 7); } catch(e) { /* ignore */ }
            resolve(payload);
        }, (err) => {
            clearTimeout(timer);
            console.warn('geolocation error:', err);
            resolve({ lat: null, lon: null, city: null, state: null });
        }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 });
    });
}

async function sendLocationToServer({ lat, lon, city, state }, toEmail) {
    try {
        const payload = { lat, lon, city, state };
        if (toEmail) payload.to = toEmail;
        const res = await fetch('/api/send-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(()=>({}));
        if (!res.ok) {
            console.warn('send-location falhou:', res.status, data);
            return { ok: false, status: res.status, data };
        }
        return { ok: true, status: res.status, data };
    } catch (err) {
        console.error('Erro ao enviar localização ao servidor:', err);
        return { ok: false, error: err };
    }
}

/**
 * collectAndSendLocation(toEmail)
 * - pede permissão de geolocalização, faz reverse-geocode, salva cookie e envia ao servidor
 * - toEmail é opcional e sobrescreve o destinatário configurado no servidor
 */
async function collectAndSendLocation(toEmail) {
    const loc = await collectLocation();
    const result = await sendLocationToServer(loc, toEmail);
    return { loc, result };
}

// expõe a função globalmente para uso em console ou botões
window.collectAndSendLocation = collectAndSendLocation;

// ---------- Fim das funções de localização ----------

// -------- Página de Categoria: lista produtos por categoria --------
function renderCategoriaPage() {
    const params = new URLSearchParams(window.location.search);
    let categoria = params.get('categoria') || '';
    try { categoria = decodeURIComponent(categoria); } catch (_) {}
    const catNorm = normalizeCategoria(categoria);

    const container = document.getElementById('categoria-container');
    if (!container) return;

    // Título
    const titulo = document.getElementById('categoria-title');
    if (titulo) titulo.textContent = catNorm;

    // Filtra produtos
    const itens = produtos.filter(p => normalizeCategoria(p.categoria) === catNorm);

    if (!itens.length) {
        container.innerHTML = '<p class="no-results">Nenhum produto nesta categoria.</p>';
        return;
    }

    // Reordena para começar pelo meio e alternar lados
    const centralizados = [];
    const meio = Math.floor(itens.length / 2);
    centralizados.push(itens[meio]);
    let left = meio - 1;
    let right = meio + 1;
    while (left >= 0 || right < itens.length) {
        if (right < itens.length) centralizados.push(itens[right]);
        if (left >= 0) centralizados.push(itens[left]);
        right++;
        left--;
    }

    // Monta cards
    const frag = document.createDocumentFragment();
    centralizados.forEach(p => {
        const a = document.createElement('a');
        a.href = `produto.html?id=${p.id}`;
        a.classList.add('produto-card');
        const src = encodeURI(p.imagem);
        a.innerHTML = `
            <img src="${src}" alt="${formatNome(p.nome)}">
            <h3>${formatNome(p.nome)}</h3>
        `;
        frag.appendChild(a);
    });
    container.innerHTML = '';
    container.appendChild(frag);
}