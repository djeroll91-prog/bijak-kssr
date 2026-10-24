/**
 * Teks surah lazim untuk latihan hafazan.
 *
 * SUMBER SAHIH: teks Arab (riwayat Uthmani), transliterasi Rumi, dan
 * terjemahan Melayu serta Inggeris diambil terus daripada API al-Quran
 * (api.alquran.cloud, edisi quran-uthmani, en.transliteration, ms.basmeih,
 * en.sahih). Fail ini dijana oleh skrip, bukan ditaip daripada ingatan,
 * supaya teks al-Quran kekal tepat dan tidak diubah suai.
 *
 * Setiap surah disimpan sebagai senarai ayat. Ayat disimpan tanpa
 * "Bismillah" pembuka (kecuali al-Fatihah, yang Bismillahnya ialah ayat
 * pertama) supaya urutan ayat sepadan dengan buku teks.
 */

export interface SurahAyah {
  /** Nombor ayat dalam surah, bermula 1. */
  n: number;
  /** Teks Arab riwayat Uthmani. */
  ar: string;
  /** Transliterasi Rumi untuk bacaan murid. */
  rumi: string;
  /** Terjemahan Melayu. */
  ms: string;
  /** Terjemahan Inggeris. */
  en: string;
}

export interface Surah {
  /** Nombor surah dalam al-Quran (1-114). */
  number: number;
  /** Id pendek untuk kunci terjemahan antara muka. */
  id: string;
  /** Nama surah dalam Rumi. */
  name: string;
  /** Tahun KSSR yang menghafaz surah ini mengikut DSKP. */
  year: 1 | 2 | 3 | 4 | 5 | 6;
  /** Bilangan ayat. */
  count: number;
  /** Ayat-ayat surah mengikut urutan. */
  ayahs: SurahAyah[];
}

/** Semua surah lazim yang dihafaz murid Tahun 1 hingga Tahun 6. */
export const SURAHS: Surah[] = [
  {
    number: 1,
    id: 'al-fatihah',
    name: 'Al-Fatihah',
    year: 1,
    count: 7,
    ayahs: [
      {
        n: 1,
        ar: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
        rumi: 'Bismillaahir Rahmaanir Raheem',
        ms: 'Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani.',
        en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      },
      {
        n: 2,
        ar: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
        rumi: 'Alhamdu lillaahi Rabbil \'aalameen',
        ms: 'Segala puji tertentu bagi Allah, Tuhan yang memelihara dan mentadbirkan sekalian alam.',
        en: '[All] praise is [due] to Allah, Lord of the worlds -',
      },
      {
        n: 3,
        ar: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
        rumi: 'Ar-Rahmaanir-Raheem',
        ms: 'Yang Maha Pemurah, lagi Maha Mengasihani.',
        en: 'The Entirely Merciful, the Especially Merciful,',
      },
      {
        n: 4,
        ar: 'مَٰلِكِ يَوْمِ ٱلدِّينِ',
        rumi: 'Maaliki Yawmid-Deen',
        ms: 'Yang Menguasai pemerintahan hari Pembalasan (hari Akhirat).',
        en: 'Sovereign of the Day of Recompense.',
      },
      {
        n: 5,
        ar: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        rumi: 'Iyyaaka na\'budu wa lyyaaka nasta\'een',
        ms: 'Engkaulah sahaja (Ya Allah) Yang Kami sembah, dan kepada Engkaulah sahaja kami memohon pertolongan.',
        en: 'It is You we worship and You we ask for help.',
      },
      {
        n: 6,
        ar: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
        rumi: 'Ihdinas-Siraatal-Mustaqeem',
        ms: 'Tunjukilah kami jalan yang lurus.',
        en: 'Guide us to the straight path -',
      },
      {
        n: 7,
        ar: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
        rumi: 'Siraatal-lazeena an\'amta \'alaihim ghayril-maghdoobi \'alaihim wa lad-daaalleen',
        ms: 'Iaitu jalan orang-orang yang Engkau telah kurniakan nikmat kepada mereka, bukan (jalan) orang-orang yang Engkau telah murkai, dan bukan pula (jalan) orang-orang yang sesat.',
        en: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
      },
    ],
  },
  {
    number: 112,
    id: 'al-ikhlas',
    name: 'Al-Ikhlas',
    year: 1,
    count: 4,
    ayahs: [
      {
        n: 1,
        ar: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
        rumi: 'Qul huwal laahu ahad',
        ms: 'Katakanlah (wahai Muhammad): "(Tuhanku) ialah Allah Yang Maha Esa;',
        en: 'Say, "He is Allah, [who is] One,',
      },
      {
        n: 2,
        ar: 'ٱللَّهُ ٱلصَّمَدُ',
        rumi: 'Allah hus-samad',
        ms: '"Allah Yang menjadi tumpuan sekalian makhluk untuk memohon sebarang hajat;',
        en: 'Allah, the Eternal Refuge.',
      },
      {
        n: 3,
        ar: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        rumi: 'Lam yalid wa lam yoolad',
        ms: '"Ia tiada beranak, dan Ia pula tidak diperanakkan;',
        en: 'He neither begets nor is born,',
      },
      {
        n: 4,
        ar: 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ',
        rumi: 'Wa lam yakul-lahu kufuwan ahad',
        ms: '"Dan tidak ada sesiapapun yang serupa denganNya".',
        en: 'Nor is there to Him any equivalent."',
      },
    ],
  },
  {
    number: 113,
    id: 'al-falaq',
    name: 'Al-Falaq',
    year: 2,
    count: 5,
    ayahs: [
      {
        n: 1,
        ar: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ',
        rumi: 'Qul a\'uzoo bi rabbil-falaq',
        ms: 'Katakanlah (wahai Muhammad); "Aku berlindung kepada (Allah) Tuhan yang menciptakan sekalian makhluk,',
        en: 'Say, "I seek refuge in the Lord of daybreak',
      },
      {
        n: 2,
        ar: 'مِن شَرِّ مَا خَلَقَ',
        rumi: 'Min sharri ma khalaq',
        ms: '"Dari bencana makhluk-makhluk yang Ia ciptakan;',
        en: 'From the evil of that which He created',
      },
      {
        n: 3,
        ar: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
        rumi: 'Wa min sharri ghasiqin iza waqab',
        ms: '"Dan dari bahaya gelap apabila ia masuk;',
        en: 'And from the evil of darkness when it settles',
      },
      {
        n: 4,
        ar: 'وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ',
        rumi: 'Wa min sharrin-naffaa-thaati fil \'uqad',
        ms: '"Dan dari kejahatan makhluk-makhluk yang menghembus-hembus pada simpulan-simpulan (dan ikatan-ikatan);',
        en: 'And from the evil of the blowers in knots',
      },
      {
        n: 5,
        ar: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
        rumi: 'Wa min shar ri haasidin iza hasad',
        ms: '"Dan dari kejahatan orang yang dengki apabila ia melakukan dengkinya".',
        en: 'And from the evil of an envier when he envies."',
      },
    ],
  },
  {
    number: 114,
    id: 'an-nas',
    name: 'An-Nas',
    year: 2,
    count: 6,
    ayahs: [
      {
        n: 1,
        ar: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ',
        rumi: 'Qul a\'uzu birabbin naas',
        ms: 'Katakanlah (wahai Muhammad): "Aku berlindung kepada (Allah) Pemulihara sekalian manusia.',
        en: 'Say, "I seek refuge in the Lord of mankind,',
      },
      {
        n: 2,
        ar: 'مَلِكِ ٱلنَّاسِ',
        rumi: 'Malikin naas',
        ms: '"Yang Menguasai sekalian manusia,',
        en: 'The Sovereign of mankind.',
      },
      {
        n: 3,
        ar: 'إِلَٰهِ ٱلنَّاسِ',
        rumi: 'Ilaahin naas',
        ms: '"Tuhan yang berhak disembah oleh sekalian manusia,',
        en: 'The God of mankind,',
      },
      {
        n: 4,
        ar: 'مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ',
        rumi: 'Min sharril was waasil khannaas',
        ms: '"Dari kejahatan pembisik penghasut yang timbul tenggelam, -',
        en: 'From the evil of the retreating whisperer -',
      },
      {
        n: 5,
        ar: 'ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ',
        rumi: 'Al lazee yuwas wisu fee sudoorin naas',
        ms: '"Yang melemparkan bisikan dan hasutannya ke dalam hati manusia, -',
        en: 'Who whispers [evil] into the breasts of mankind -',
      },
      {
        n: 6,
        ar: 'مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ',
        rumi: 'Minal jinnati wan naas',
        ms: '"(Iaitu pembisik dan penghasut) dari kalangan jin dan manusia".',
        en: 'From among the jinn and mankind."',
      },
    ],
  },
  {
    number: 109,
    id: 'al-kafirun',
    name: 'Al-Kafirun',
    year: 3,
    count: 6,
    ayahs: [
      {
        n: 1,
        ar: 'قُلْ يَٰٓأَيُّهَا ٱلْكَٰفِرُونَ',
        rumi: 'Qul yaa-ai yuhal kaafiroon',
        ms: 'Katakanlah (wahai Muhammad): "Hai orang-orang kafir!',
        en: 'Say, "O disbelievers,',
      },
      {
        n: 2,
        ar: 'لَآ أَعْبُدُ مَا تَعْبُدُونَ',
        rumi: 'Laa a\'budu ma t\'abudoon',
        ms: '"Aku tidak akan menyembah apa yang kamu sembah.',
        en: 'I do not worship what you worship.',
      },
      {
        n: 3,
        ar: 'وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ',
        rumi: 'Wa laa antum \'aabidoona maa a\'bud',
        ms: '"Dan kamu tidak mahu menyembah (Allah) yang aku sembah.',
        en: 'Nor are you worshippers of what I worship.',
      },
      {
        n: 4,
        ar: 'وَلَآ أَنَا۠ عَابِدٌۭ مَّا عَبَدتُّمْ',
        rumi: 'Wa laa ana \'abidum maa \'abattum',
        ms: '"Dan aku tidak akan beribadat secara kamu beribadat.',
        en: 'Nor will I be a worshipper of what you worship.',
      },
      {
        n: 5,
        ar: 'وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ',
        rumi: 'Wa laa antum \'aabidoona ma a\'bud',
        ms: '"Dan kamu pula tidak mahu beribadat secara aku beribadat.',
        en: 'Nor will you be worshippers of what I worship.',
      },
      {
        n: 6,
        ar: 'لَكُمْ دِينُكُمْ وَلِىَ دِينِ',
        rumi: 'Lakum deenukum wa liya deen.',
        ms: '"Bagi kamu ugama kamu, dan bagiku ugamaku".',
        en: 'For you is your religion, and for me is my religion."',
      },
    ],
  },
  {
    number: 103,
    id: 'al-asr',
    name: 'Al-Asr',
    year: 3,
    count: 3,
    ayahs: [
      {
        n: 1,
        ar: 'وَٱلْعَصْرِ',
        rumi: 'Wal\' asr',
        ms: 'Demi Masa!',
        en: 'By time,',
      },
      {
        n: 2,
        ar: 'إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ',
        rumi: 'Innal insaana lafee khusr',
        ms: 'Sesungguhnya manusia itu dalam kerugian -',
        en: 'Indeed, mankind is in loss,',
      },
      {
        n: 3,
        ar: 'إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ',
        rumi: 'Il lal lazeena aamanu wa \'amilus saali haati wa tawa saw bil haqqi wa tawa saw bis sabr',
        ms: 'Kecuali orang-orang yang beriman dan beramal soleh, dan mereka pula berpesan-pesan dengan kebenaran serta berpesan-pesan dengan sabar.',
        en: 'Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.',
      },
    ],
  },
  {
    number: 101,
    id: 'al-qariah',
    name: 'Al-Qariah',
    year: 4,
    count: 11,
    ayahs: [
      {
        n: 1,
        ar: 'ٱلْقَارِعَةُ',
        rumi: 'Al qaari\'ah',
        ms: 'Hari yang menggemparkan,',
        en: 'The Striking Calamity -',
      },
      {
        n: 2,
        ar: 'مَا ٱلْقَارِعَةُ',
        rumi: 'Mal qaariah',
        ms: 'Apa dia hari yang menggemparkan itu?',
        en: 'What is the Striking Calamity?',
      },
      {
        n: 3,
        ar: 'وَمَآ أَدْرَىٰكَ مَا ٱلْقَارِعَةُ',
        rumi: 'Wa maa adraaka mal qaari\'ah',
        ms: 'Dan apa jalannya engkau dapat mengetahui kedahsyatan hari yang menggemparkan itu? -',
        en: 'And what can make you know what is the Striking Calamity?',
      },
      {
        n: 4,
        ar: 'يَوْمَ يَكُونُ ٱلنَّاسُ كَٱلْفَرَاشِ ٱلْمَبْثُوثِ',
        rumi: 'Yauma ya koonun naasu kal farashil mabthooth',
        ms: '(Hari itu ialah: hari kiamat), hari manusia menjadi seperti kelkatu yang terbang berkeliaran,',
        en: 'It is the Day when people will be like moths, dispersed,',
      },
      {
        n: 5,
        ar: 'وَتَكُونُ ٱلْجِبَالُ كَٱلْعِهْنِ ٱلْمَنفُوشِ',
        rumi: 'Wa ta koonul jibalu kal \'ihnil manfoosh',
        ms: 'Dan gunung-ganang menjadi seperti bulu yang dibusar berterbangan.',
        en: 'And the mountains will be like wool, fluffed up.',
      },
      {
        n: 6,
        ar: 'فَأَمَّا مَن ثَقُلَتْ مَوَٰزِينُهُۥ',
        rumi: 'Fa-amma man thaqulat mawa zeenuh',
        ms: 'Setelah berlaku demikian, maka (manusia akan diberikan tempatnya menurut amal masing-masing); adapun orang yang berat timbangan amal baiknya, -',
        en: 'Then as for one whose scales are heavy [with good deeds],',
      },
      {
        n: 7,
        ar: 'فَهُوَ فِى عِيشَةٍۢ رَّاضِيَةٍۢ',
        rumi: 'Fahuwa fee \'ishatir raadiyah',
        ms: 'Maka ia berada dalam kehidupan yang senang lenang.',
        en: 'He will be in a pleasant life.',
      },
      {
        n: 8,
        ar: 'وَأَمَّا مَنْ خَفَّتْ مَوَٰزِينُهُۥ',
        rumi: 'Wa amma man khaffat mawa zeenuh',
        ms: 'Sebaliknya orang yang ringan timbangan amal baiknya, -',
        en: 'But as for one whose scales are light,',
      },
      {
        n: 9,
        ar: 'فَأُمُّهُۥ هَاوِيَةٌۭ',
        rumi: 'Fa-ummuhu haawiyah',
        ms: 'Maka tempat kembalinya ialah "Haawiyah"',
        en: 'His refuge will be an abyss.',
      },
      {
        n: 10,
        ar: 'وَمَآ أَدْرَىٰكَ مَا هِيَهْ',
        rumi: 'Wa maa adraaka maa hiyah',
        ms: 'Dan apa jalannya engkau dapat mengetahui, apa dia "Haawiyah" itu?',
        en: 'And what can make you know what that is?',
      },
      {
        n: 11,
        ar: 'نَارٌ حَامِيَةٌۢ',
        rumi: 'Naarun hamiyah',
        ms: '(Haawiyah itu ialah): api yang panas membakar.',
        en: 'It is a Fire, intensely hot.',
      },
    ],
  },
  {
    number: 97,
    id: 'al-qadr',
    name: 'Al-Qadr',
    year: 5,
    count: 5,
    ayahs: [
      {
        n: 1,
        ar: 'بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ إِنَّآ أَنزَلْنَٰهُ فِى لَيْلَةِ ٱلْقَدْرِ',
        rumi: 'Innaa anzalnaahu fee lailatil qadr',
        ms: 'Sesungguhnya Kami telah menurunkan (Al-Quran) ini pada Malam Lailatul-Qadar,',
        en: 'Indeed, We sent the Qur\'an down during the Night of Decree.',
      },
      {
        n: 2,
        ar: 'وَمَآ أَدْرَىٰكَ مَا لَيْلَةُ ٱلْقَدْرِ',
        rumi: 'Wa maa adraaka ma lailatul qadr',
        ms: 'Dan apa jalannya engkau dapat mengetahui apa dia kebesaran Malam Lailatul-Qadar itu?',
        en: 'And what can make you know what is the Night of Decree?',
      },
      {
        n: 3,
        ar: 'لَيْلَةُ ٱلْقَدْرِ خَيْرٌۭ مِّنْ أَلْفِ شَهْرٍۢ',
        rumi: 'Lailatul qadri khairum min alfee shahr',
        ms: 'Malam Lailatul-Qadar lebih baik daripada seribu bulan.',
        en: 'The Night of Decree is better than a thousand months.',
      },
      {
        n: 4,
        ar: 'تَنَزَّلُ ٱلْمَلَٰٓئِكَةُ وَٱلرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍۢ',
        rumi: 'Tanaz zalul malaa-ikatu war roohu feeha bi izni-rab bihim min kulli amr',
        ms: 'Pada Malam itu, turun malaikat dan Jibril dengan izin Tuhan mereka, kerana membawa segala perkara (yang ditakdirkan berlakunya pada tahun yang berikut);',
        en: 'The angels and the Spirit descend therein by permission of their Lord for every matter.',
      },
      {
        n: 5,
        ar: 'سَلَٰمٌ هِىَ حَتَّىٰ مَطْلَعِ ٱلْفَجْرِ',
        rumi: 'Salaamun hiya hattaa mat la\'il fajr',
        ms: 'Sejahteralah Malam (yang berkat) itu hingga terbit fajar!',
        en: 'Peace it is until the emergence of dawn.',
      },
    ],
  },
  {
    number: 93,
    id: 'ad-dhuha',
    name: 'Ad-Dhuha',
    year: 6,
    count: 11,
    ayahs: [
      {
        n: 1,
        ar: 'وَٱلضُّحَىٰ',
        rumi: 'Wad duhaa',
        ms: 'Demi waktu dhuha,',
        en: 'By the morning brightness',
      },
      {
        n: 2,
        ar: 'وَٱلَّيْلِ إِذَا سَجَىٰ',
        rumi: 'Wal laili iza sajaa',
        ms: 'Dan malam apabila ia sunyi-sepi -',
        en: 'And [by] the night when it covers with darkness,',
      },
      {
        n: 3,
        ar: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ',
        rumi: 'Ma wad da\'aka rabbuka wa ma qalaa',
        ms: '(Bahawa) Tuhanmu (wahai Muhammad) tidak meninggalkanmu, dan Ia tidak benci (kepadamu, sebagaimana yang dituduh oleh kaum musyrik).',
        en: 'Your Lord has not taken leave of you, [O Muhammad], nor has He detested [you].',
      },
      {
        n: 4,
        ar: 'وَلَلْءَاخِرَةُ خَيْرٌۭ لَّكَ مِنَ ٱلْأُولَىٰ',
        rumi: 'Walal-aakhiratu khairul laka minal-oola',
        ms: 'Dan sesungguhnya kesudahan keaadaanmu adalah lebih baik bagimu daripada permulaannya.',
        en: 'And the Hereafter is better for you than the first [life].',
      },
      {
        n: 5,
        ar: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰٓ',
        rumi: 'Wa la sawfa y\'uteeka rabbuka fatarda',
        ms: 'Dan sesungguhnya Tuhanmu akan memberikanmu (kejayaan dan kebahagiaan di dunia dan di akhirat) sehingga engkau reda - berpuas hati.',
        en: 'And your Lord is going to give you, and you will be satisfied.',
      },
      {
        n: 6,
        ar: 'أَلَمْ يَجِدْكَ يَتِيمًۭا فَـَٔاوَىٰ',
        rumi: 'Alam ya jidka yateeman fa aawaa',
        ms: 'Bukankah dia mendapati engkau yatim piatu, lalu la memberikan perlindungan?',
        en: 'Did He not find you an orphan and give [you] refuge?',
      },
      {
        n: 7,
        ar: 'وَوَجَدَكَ ضَآلًّۭا فَهَدَىٰ',
        rumi: 'Wa wa jadaka daal lan fahada',
        ms: 'Dan didapatiNya engkau mencari-cari (jalan yang benar), lalu Ia memberikan hidayah petunjuk (dengan wahyu - Al-Quran)?',
        en: 'And He found you lost and guided [you],',
      },
      {
        n: 8,
        ar: 'وَوَجَدَكَ عَآئِلًۭا فَأَغْنَىٰ',
        rumi: 'Wa wa jadaka \'aa-ilan fa aghnaa',
        ms: 'Dan didapatiNya engkau miskin, lalu Ia memberikan kekayaan?',
        en: 'And He found you poor and made [you] self-sufficient.',
      },
      {
        n: 9,
        ar: 'فَأَمَّا ٱلْيَتِيمَ فَلَا تَقْهَرْ',
        rumi: 'Fa am mal yateema fala taqhar',
        ms: 'Oleh itu, adapun anak yatim maka janganlah engkau berlaku kasar terhadapnya,',
        en: 'So as for the orphan, do not oppress [him].',
      },
      {
        n: 10,
        ar: 'وَأَمَّا ٱلسَّآئِلَ فَلَا تَنْهَرْ',
        rumi: 'Wa am mas saa-ila fala tanhar',
        ms: 'Adapun orang yang meminta (bantuan pimpinan) maka janganlah engkau tengking herdik;',
        en: 'And as for the petitioner, do not repel [him].',
      },
      {
        n: 11,
        ar: 'وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ',
        rumi: 'Wa amma bi ni\'mati rabbika fahad dith',
        ms: 'Adapun nikmat Tuhanmu, maka hendaklah engkau sebut-sebutkan (dan zahirkan) sebagai bersyukur kepadaNya.',
        en: 'But as for the favor of your Lord, report [it].',
      },
    ],
  },
];

/** Cari surah mengikut id pendek. */
export function surahById(id: string): Surah | undefined {
  return SURAHS.find((s) => s.id === id);
}

/** Semua surah yang dihafaz pada tahun tertentu. */
export function surahsForYear(year: number): Surah[] {
  return SURAHS.filter((s) => s.year === year);
}

/**
 * Surah bagi satu topik, mengikut urutan id dalam `topic.surahs`.
 * Id yang tidak dikenali dilangkau supaya ralat data tidak memaparkan kad kosong.
 */
export function surahsForTopic(topic: { surahs?: string[] }): Surah[] {
  if (!topic.surahs || topic.surahs.length === 0) return [];
  return topic.surahs
    .map((id) => surahById(id))
    .filter((s): s is Surah => s !== undefined);
}
