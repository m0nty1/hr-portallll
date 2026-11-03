/** Seed data / column definitions for the 21 lookup tables. Generated from Figma frames 31.01–31.12 and 32.01–32.09 (HR Portal). Each tab = one lookup table.
 *  API: GET/POST/PUT/DELETE /api/settings/lookups/{slug}. */
export type ColType = 'key' | 'text' | 'select' | 'check' | 'date';
export interface LookupCol { key: string; label: string; type: ColType; w: number; options?: string[]; }
export interface LookupTab { slug: string; /** Row id field when the first column is not unique. */ idKey?: string; tab: string; add: string; search: string; cols: LookupCol[]; rows: Record<string, string | boolean | number>[]; }
export const HR_TABS: LookupTab[] = [
 {
  "slug": "banks",
  "tab": "البنوك",
  "add": "إضافة بنك",
  "search": "ابحث باسم البنك أو كوده...",
  "cols": [
   {
    "key": "code",
    "label": "كود البنك",
    "type": "key",
    "w": 239
   },
   {
    "key": "name",
    "label": "اسم البنك",
    "type": "text",
    "w": 717
   },
   {
    "key": "swiftCode",
    "label": "السويفت كود",
    "type": "text",
    "w": 717
   }
  ],
  "rows": [
   {
    "code": "001",
    "name": "البنك الأهلي المصري",
    "swiftCode": "NBEGEGCX"
   },
   {
    "code": "002",
    "name": "بنك مصر",
    "swiftCode": "BMISEGCX"
   },
   {
    "code": "003",
    "name": "البنك التجاري الدولي",
    "swiftCode": "CIBEEGCX"
   },
   {
    "code": "004",
    "name": "بنك القاهرة",
    "swiftCode": "BCAIEGCX"
   },
   {
    "code": "005",
    "name": "بنك الإسكندرية",
    "swiftCode": "ALEXEGCX"
   },
   {
    "code": "006",
    "name": "بنك قناة السويس",
    "swiftCode": "SUCAEGCX"
   }
  ]
 },
 {
  "slug": "branches",
  "tab": "البنوك الفرعية",
  "add": "إضافة بنك فرعي",
  "search": "ابحث بكود أو اسم البنك الفرعي...",
  "cols": [
   {
    "key": "code",
    "label": "كود البنك",
    "type": "key",
    "w": 196
   },
   {
    "key": "name",
    "label": "اسم البنك الفرعي",
    "type": "text",
    "w": 393
   },
   {
    "key": "shortName",
    "label": "الاسم المختصر",
    "type": "text",
    "w": 295
   },
   {
    "key": "salaryBank",
    "label": "اسم البنك التابع له (مرتبات)",
    "type": "select",
    "w": 393,
    "options": [
     "البنك الأهلي المصري",
     "البنك التجاري الدولي",
     "بنك القاهرة",
     "بنك مصر"
    ]
   },
   {
    "key": "transferBank",
    "label": "اسم البنك التابع له (تحويل البنك)",
    "type": "select",
    "w": 393,
    "options": [
     "البنك الأهلي المصري",
     "البنك التجاري الدولي",
     "بنك القاهرة",
     "بنك مصر"
    ]
   }
  ],
  "rows": [
   {
    "code": "101",
    "name": "فرع أسوان",
    "shortName": "أسوان",
    "salaryBank": "البنك الأهلي المصري",
    "transferBank": "البنك الأهلي المصري"
   },
   {
    "code": "102",
    "name": "فرع أسوان الجديدة",
    "shortName": "أسوان الجديدة",
    "salaryBank": "بنك مصر",
    "transferBank": "بنك مصر"
   },
   {
    "code": "103",
    "name": "فرع كورنيش النيل",
    "shortName": "الكورنيش",
    "salaryBank": "البنك التجاري الدولي",
    "transferBank": "البنك التجاري الدولي"
   },
   {
    "code": "104",
    "name": "فرع السوق",
    "shortName": "السوق",
    "salaryBank": "بنك القاهرة",
    "transferBank": "بنك القاهرة"
   },
   {
    "code": "105",
    "name": "فرع إدفو",
    "shortName": "إدفو",
    "salaryBank": "البنك الأهلي المصري",
    "transferBank": "بنك مصر"
   },
   {
    "code": "106",
    "name": "فرع كوم أمبو",
    "shortName": "كوم أمبو",
    "salaryBank": "بنك مصر",
    "transferBank": "البنك الأهلي المصري"
   }
  ]
 },
 {
  "slug": "sectors",
  "tab": "القطاعات",
  "add": "إضافة قطاع",
  "search": "ابحث بكود أو اسم القطاع...",
  "cols": [
   {
    "key": "code",
    "label": "كود القطاع",
    "type": "key",
    "w": 334
   },
   {
    "key": "name",
    "label": "اسم القطاع",
    "type": "text",
    "w": 1339
   }
  ],
  "rows": [
   {"code": "06", "name": "قطاع الشئون التجارية"},
   {"code": "07", "name": "قطاع الشئون القانونية"},
   {
    "code": "01",
    "name": "المركز الرئيسي"
   },
   {
    "code": "02",
    "name": "أسوان"
   },
   {
    "code": "03",
    "name": "الأقصر"
   },
   {
    "code": "04",
    "name": "قنا"
   },
   {
    "code": "05",
    "name": "سوهاج"
   }
  ]
 },
 {
  "slug": "engineering",
  "tab": "الهندسات",
  "add": "إضافة هندسة",
  "search": "ابحث بكود أو اسم الهندسة...",
  "cols": [
   {
    "key": "code",
    "label": "كود الهندسة",
    "type": "key",
    "w": 279
   },
   {
    "key": "name",
    "label": "اسم الهندسة",
    "type": "text",
    "w": 697
   },
   {
    "key": "sector",
    "label": "القطاع التابعة له",
    "type": "select",
    "w": 697,
    "options": [
     "أسوان",
     "الأقصر",
     "سوهاج",
     "قنا"
    ]
   }
  ],
  "rows": [
   {
    "code": "01",
    "name": "هندسة أسوان",
    "sector": "أسوان"
   },
   {
    "code": "02",
    "name": "هندسة إدفو",
    "sector": "أسوان"
   },
   {
    "code": "03",
    "name": "هندسة كوم أمبو",
    "sector": "أسوان"
   },
   {
    "code": "04",
    "name": "هندسة الأقصر",
    "sector": "الأقصر"
   },
   {
    "code": "05",
    "name": "هندسة نجع حمادي",
    "sector": "قنا"
   },
   {
    "code": "06",
    "name": "هندسة أخميم",
    "sector": "سوهاج"
   }
  ]
 },
 {
  "slug": "cost-centers",
  "tab": "مراكز التكلفة",
  "add": "إضافة مركز تكلفة",
  "search": "ابحث بكود أو اسم مركز التكلفة...",
  "cols": [
   {
    "key": "code",
    "label": "كود مركز التكلفة",
    "type": "key",
    "w": 334
   },
   {
    "key": "name",
    "label": "اسم مركز التكلفة",
    "type": "text",
    "w": 1339
   }
  ],
  "rows": [
   {
    "code": "801",
    "name": "الإدارة العامة للشئون المالية"
   },
   {
    "code": "802",
    "name": "الإدارة العامة للموارد البشرية"
   },
   {
    "code": "803",
    "name": "الإدارة العامة للتشغيل"
   },
   {
    "code": "871",
    "name": "الإدارة العامة لوسائل النقل"
   },
   {
    "code": "880",
    "name": "الإدارة العامة للشئون القانونية"
   }
  ]
 },
 {
  "slug": "departments",
  "tab": "الإدارات",
  "add": "إضافة إدارة",
  "search": "ابحث بكود أو اسم الإدارة...",
  "cols": [
   {
    "key": "code",
    "label": "كود الإدارة",
    "type": "key",
    "w": 209
   },
   {
    "key": "name",
    "label": "اسم الإدارة",
    "type": "text",
    "w": 523
   },
   {
    "key": "sector",
    "label": "القطاع التابع له الإدارة",
    "type": "select",
    "w": 418,
    "options": [
     "أسوان",
     "الأقصر",
     "المركز الرئيسي"
    ]
   },
   {
    "key": "costCenter",
    "label": "مركز التكلفة التابع له الإدارة",
    "type": "select",
    "w": 523,
    "options": [
     "801 - الإدارة العامة للشئون المالية",
     "802 - الإدارة العامة للموارد البشرية",
     "803 - الإدارة العامة للتشغيل",
     "871 - الإدارة العامة لوسائل النقل",
     "880 - الإدارة العامة للشئون القانونية"
    ]
   }
  ],
  "rows": [
   {"code": "110", "name": "الإدارة العامة للشئون الفنية", "sector": "المركز الرئيسي", "costCenter": "871 - الإدارة العامة لوسائل النقل"},
   {"code": "111", "name": "قطاع الشئون التجارية", "sector": "المركز الرئيسي", "costCenter": "871 - الإدارة العامة لوسائل النقل"},
   {"code": "112", "name": "الإدارة العامة للمشتريات", "sector": "المركز الرئيسي", "costCenter": "871 - الإدارة العامة لوسائل النقل"},
   {"code": "113", "name": "الإدارة العليا", "sector": "المركز الرئيسي", "costCenter": "871 - الإدارة العامة لوسائل النقل"},
   {"code": "114", "name": "إدارة تقنية المعلومات", "sector": "المركز الرئيسي", "costCenter": "871 - الإدارة العامة لوسائل النقل"},
   {"code": "115", "name": "الإدارة العامة للأمن", "sector": "المركز الرئيسي", "costCenter": "871 - الإدارة العامة لوسائل النقل"},
   {"code": "116", "name": "ضاع مجلس الادارة والادارة العليا", "sector": "المركز الرئيسي", "costCenter": "871 - الإدارة العامة لوسائل النقل"},
   {"code": "117", "name": "المنتدب واعضاء مجلس الادارة", "sector": "المركز الرئيسي", "costCenter": "871 - الإدارة العامة لوسائل النقل"},
   {
    "code": "101",
    "name": "الإدارة العامة للشئون المالية",
    "sector": "المركز الرئيسي",
    "costCenter": "801 - الإدارة العامة للشئون المالية"
   },
   {
    "code": "102",
    "name": "الإدارة العامة للموارد البشرية",
    "sector": "المركز الرئيسي",
    "costCenter": "802 - الإدارة العامة للموارد البشرية"
   },
   {
    "code": "103",
    "name": "الإدارة العامة للتشغيل",
    "sector": "أسوان",
    "costCenter": "803 - الإدارة العامة للتشغيل"
   },
   {
    "code": "104",
    "name": "الإدارة العامة لوسائل النقل",
    "sector": "المركز الرئيسي",
    "costCenter": "871 - الإدارة العامة لوسائل النقل"
   },
   {
    "code": "105",
    "name": "الإدارة العامة للشئون القانونية",
    "sector": "الأقصر",
    "costCenter": "880 - الإدارة العامة للشئون القانونية"
   }
  ]
 },
 {
  "slug": "job-groups",
  "tab": "المجموعات الوظيفية",
  "add": "إضافة مجموعة وظيفية",
  "search": "ابحث بكود أو اسم المجموعة الوظيفية...",
  "cols": [
   {
    "key": "code",
    "label": "كود المجموعة الوظيفية",
    "type": "key",
    "w": 338
   },
   {
    "key": "name",
    "label": "اسم المجموعة الوظيفية",
    "type": "text",
    "w": 1355
   }
  ],
  "rows": [
   {
    "code": "01",
    "name": "المجموعة الإدارية"
   },
   {
    "code": "02",
    "name": "المجموعة المالية والمحاسبية"
   },
   {
    "code": "03",
    "name": "المجموعة الهندسية"
   },
   {
    "code": "04",
    "name": "المجموعة الفنية"
   },
   {
    "code": "05",
    "name": "المجموعة القانونية"
   }
  ]
 },
 {
  "slug": "jobs",
  "tab": "الوظائف",
  "add": "إضافة وظيفة",
  "search": "ابحث بكود أو اسم الوظيفة...",
  "cols": [
   {
    "key": "code",
    "label": "كود الوظيفة",
    "type": "key",
    "w": 282
   },
   {
    "key": "name",
    "label": "اسم الوظيفة",
    "type": "text",
    "w": 705
   },
   {
    "key": "jobGroup",
    "label": "المجموعة الوظيفية",
    "type": "select",
    "w": 705,
    "options": [
     "المجموعة الإدارية",
     "المجموعة الفنية",
     "المجموعة القانونية",
     "المجموعة المالية والمحاسبية",
     "المجموعة الهندسية"
    ]
   }
  ],
  "rows": [
   {
    "code": "1001",
    "name": "أخصائي محاسبة",
    "jobGroup": "المجموعة المالية والمحاسبية"
   },
   {
    "code": "1002",
    "name": "مهندس كهرباء",
    "jobGroup": "المجموعة الهندسية"
   },
   {
    "code": "1003",
    "name": "فني كهرباء",
    "jobGroup": "المجموعة الفنية"
   },
   {
    "code": "1004",
    "name": "كاتب إداري",
    "jobGroup": "المجموعة الإدارية"
   },
   {
    "code": "1005",
    "name": "مستشار قانوني",
    "jobGroup": "المجموعة القانونية"
   }
  ]
 },
 {
  "slug": "job-status",
  "tab": "الحالة الوظيفية",
  "add": "إضافة حالة وظيفية",
  "search": "ابحث بكود أو اسم الحالة الوظيفية...",
  "cols": [
   {
    "key": "code",
    "label": "كود الحالة الوظيفية",
    "type": "key",
    "w": 338
   },
   {
    "key": "name",
    "label": "اسم الحالة الوظيفية",
    "type": "text",
    "w": 1355
   }
  ],
  "rows": [
   {
    "code": "01",
    "name": "قائم"
   },
   {
    "code": "02",
    "name": "معاش"
   },
   {
    "code": "03",
    "name": "إجازة"
   },
   {
    "code": "04",
    "name": "نقل"
   },
   {
    "code": "05",
    "name": "تجنيد"
   },
   {
    "code": "06",
    "name": "استدعاء"
   }
  ]
 },
 {
  "slug": "hiring-types",
  "tab": "نوع التعيين",
  "add": "إضافة نوع تعيين",
  "search": "ابحث بكود أو نوع التعيين...",
  "cols": [
   {
    "key": "code",
    "label": "كود نوع التعيين",
    "type": "key",
    "w": 338
   },
   {
    "key": "name",
    "label": "نوع التعيين",
    "type": "text",
    "w": 1355
   }
  ],
  "rows": [
   {
    "code": "01",
    "name": "دائم"
   },
   {
    "code": "02",
    "name": "مكافأة شاملة"
   },
   {
    "code": "03",
    "name": "عقد"
   }
  ]
 },
 {
  "slug": "grades",
  "tab": "الدرجات الوظيفية",
  "add": "إضافة درجة وظيفية",
  "search": "ابحث بكود أو اسم الدرجة الوظيفية...",
  "cols": [
   {
    "key": "code",
    "label": "كود الدرجة الوظيفية",
    "type": "key",
    "w": 111
   },
   {
    "key": "name",
    "label": "اسم الدرجة",
    "type": "text",
    "w": 222
   },
   {
    "key": "rankCode",
    "label": "كود ترتيب الدرجة",
    "type": "text",
    "w": 111
   },
   {
    "key": "scaleStart",
    "label": "بداية مربوط الدرجة",
    "type": "text",
    "w": 138
   },
   {
    "key": "scaleEnd",
    "label": "نهاية مربوط الدرجة",
    "type": "text",
    "w": 138
   },
   {
    "key": "affiliationScale",
    "label": "مربوط الانتماء",
    "type": "text",
    "w": 138
   },
   {
    "key": "representationAllowance",
    "label": "بدل تمثيل",
    "type": "text",
    "w": 138
   },
   {
    "key": "hospitalityUnder5",
    "label": "بدل ضيافة حتى خمس سنوات",
    "type": "text",
    "w": 152
   },
   {
    "key": "hospitalityOver5",
    "label": "بدل ضيافة أكثر من خمس سنوات",
    "type": "text",
    "w": 152
   },
   {
    "key": "exceptionalRaise",
    "label": "العلاوة الاستثنائية",
    "type": "text",
    "w": 138
   },
   {
    "key": "disabilityFund",
    "label": "صندوق الإعاقة",
    "type": "text",
    "w": 124
   },
   {
    "key": "yearsInGrade",
    "label": "عدد سنوات الدرجة",
    "type": "text",
    "w": 124
   }
  ],
  "rows": [
   {
    "code": "01",
    "name": "الدرجة الممتازة",
    "rankCode": "01",
    "scaleStart": "2,400",
    "scaleEnd": "4,800",
    "affiliationScale": "600",
    "representationAllowance": "1,000",
    "hospitalityUnder5": "500",
    "hospitalityOver5": "700",
    "exceptionalRaise": "150",
    "disabilityFund": "40",
    "yearsInGrade": "6"
   },
   {
    "code": "02",
    "name": "الدرجة العليا",
    "rankCode": "02",
    "scaleStart": "2,000",
    "scaleEnd": "4,200",
    "affiliationScale": "500",
    "representationAllowance": "800",
    "hospitalityUnder5": "400",
    "hospitalityOver5": "600",
    "exceptionalRaise": "130",
    "disabilityFund": "35",
    "yearsInGrade": "6"
   },
   {
    "code": "03",
    "name": "الدرجة الأولى",
    "rankCode": "03",
    "scaleStart": "1,500",
    "scaleEnd": "3,600",
    "affiliationScale": "400",
    "representationAllowance": "600",
    "hospitalityUnder5": "300",
    "hospitalityOver5": "450",
    "exceptionalRaise": "110",
    "disabilityFund": "30",
    "yearsInGrade": "7"
   },
   {
    "code": "04",
    "name": "الدرجة الثانية",
    "rankCode": "04",
    "scaleStart": "1,100",
    "scaleEnd": "3,000",
    "affiliationScale": "300",
    "representationAllowance": "400",
    "hospitalityUnder5": "200",
    "hospitalityOver5": "300",
    "exceptionalRaise": "90",
    "disabilityFund": "25",
    "yearsInGrade": "8"
   },
   {
    "code": "05",
    "name": "الدرجة الثالثة",
    "rankCode": "05",
    "scaleStart": "800",
    "scaleEnd": "2,400",
    "affiliationScale": "250",
    "representationAllowance": "250",
    "hospitalityUnder5": "150",
    "hospitalityOver5": "200",
    "exceptionalRaise": "70",
    "disabilityFund": "20",
    "yearsInGrade": "8"
   }
  ]
 },
 {
  "slug": "qualifications",
  "tab": "المؤهل الدراسي",
  "add": "إضافة مؤهل دراسي",
  "search": "ابحث بكود أو اسم المؤهل الدراسي...",
  "cols": [
   {
    "key": "code",
    "label": "كود المؤهل الدراسي",
    "type": "key",
    "w": 282
   },
   {
    "key": "name",
    "label": "اسم المؤهل الدراسي",
    "type": "text",
    "w": 705
   },
   {
    "key": "level",
    "label": "نوع المؤهل الدراسي",
    "type": "select",
    "w": 705,
    "options": [
     "عالي",
     "فوق متوسط",
     "متوسط"
    ]
   }
  ],
  "rows": [
   {
    "code": "01",
    "name": "دبلوم صنايع",
    "level": "متوسط"
   },
   {
    "code": "02",
    "name": "دبلوم تجارة",
    "level": "متوسط"
   },
   {
    "code": "03",
    "name": "معهد فني",
    "level": "فوق متوسط"
   },
   {
    "code": "04",
    "name": "بكالوريوس تجارة",
    "level": "عالي"
   },
   {
    "code": "05",
    "name": "بكالوريوس هندسة",
    "level": "عالي"
   }
  ]
 }
];
export const SALARY_TABS: LookupTab[] = [
 {
  "slug": "installment-groups",
  "tab": "مجموعات الأقساط",
  "add": "إضافة مجموعة أقساط",
  "search": "ابحث بكود أو اسم مجموعة الأقساط...",
  "cols": [
   {
    "key": "code",
    "label": "كود المجموعة",
    "type": "key",
    "w": 308
   },
   {
    "key": "name",
    "label": "اسم مجموعة الأقساط",
    "type": "text",
    "w": 924
   },
   {
    "key": "taxExempt",
    "label": "إعفاء من الضرائب",
    "type": "check",
    "w": 462
   }
  ],
  "rows": [
   {
    "code": "01",
    "name": "أقساط السلف",
    "taxExempt": true
   },
   {
    "code": "02",
    "name": "أقساط قروض الإسكان",
    "taxExempt": false
   },
   {
    "code": "03",
    "name": "أقساط التأمين على الحياة",
    "taxExempt": true
   },
   {
    "code": "04",
    "name": "أقساط الجمعية الاستهلاكية",
    "taxExempt": false
   },
   {
    "code": "05",
    "name": "أقساط الصندوق الخاص",
    "taxExempt": true
   }
  ]
 },
 {
  "slug": "installment-accounts",
  "tab": "حسابات الأقساط",
  "add": "إضافة حساب أقساط",
  "search": "ابحث بكود أو اسم حساب الأقساط...",
  "cols": [
   {
    "key": "code",
    "label": "كود حساب الأقساط",
    "type": "key",
    "w": 338
   },
   {
    "key": "name",
    "label": "اسم حساب الأقساط",
    "type": "text",
    "w": 1355
   }
  ],
  "rows": [
   {
    "code": "01",
    "name": "حساب أقساط السلف"
   },
   {
    "code": "02",
    "name": "حساب أقساط قروض الإسكان"
   },
   {
    "code": "03",
    "name": "حساب أقساط التأمين على الحياة"
   },
   {
    "code": "04",
    "name": "حساب أقساط الجمعية الاستهلاكية"
   }
  ]
 },
 {
  "slug": "installment-types",
  "tab": "أنواع الأقساط",
  "add": "إضافة نوع قسط",
  "search": "ابحث بكود أو نوع القسط...",
  "cols": [
   {
    "key": "code",
    "label": "كود القسط",
    "type": "key",
    "w": 242
   },
   {
    "key": "name",
    "label": "نوع القسط",
    "type": "text",
    "w": 484
   },
   {
    "key": "installmentGroup",
    "label": "مجموعة الأقساط",
    "type": "select",
    "w": 484,
    "options": [
     "أقساط التأمين على الحياة",
     "أقساط الجمعية الاستهلاكية",
     "أقساط السلف",
     "أقساط قروض الإسكان"
    ]
   },
   {
    "key": "installmentAccount",
    "label": "حساب القسط",
    "type": "select",
    "w": 484,
    "options": [
     "حساب أقساط التأمين على الحياة",
     "حساب أقساط الجمعية الاستهلاكية",
     "حساب أقساط السلف",
     "حساب أقساط قروض الإسكان"
    ]
   }
  ],
  "rows": [
   {
    "code": "01",
    "name": "قسط سلفة عادية",
    "installmentGroup": "أقساط السلف",
    "installmentAccount": "حساب أقساط السلف"
   },
   {
    "code": "02",
    "name": "قسط سلفة طارئة",
    "installmentGroup": "أقساط السلف",
    "installmentAccount": "حساب أقساط السلف"
   },
   {
    "code": "03",
    "name": "قسط قرض إسكان",
    "installmentGroup": "أقساط قروض الإسكان",
    "installmentAccount": "حساب أقساط قروض الإسكان"
   },
   {
    "code": "04",
    "name": "قسط تأمين على الحياة",
    "installmentGroup": "أقساط التأمين على الحياة",
    "installmentAccount": "حساب أقساط التأمين على الحياة"
   },
   {
    "code": "05",
    "name": "قسط الجمعية الاستهلاكية",
    "installmentGroup": "أقساط الجمعية الاستهلاكية",
    "installmentAccount": "حساب أقساط الجمعية الاستهلاكية"
   }
  ]
 },
 {
  "slug": "tax-groups",
  "tab": "المجموعات الضريبية للصرفيات",
  "add": "إضافة مجموعة",
  "search": "ابحث بكود أو اسم مجموعة الصرفيات...",
  "cols": [
   {
    "key": "code",
    "label": "كود المجموعة",
    "type": "key",
    "w": 308
   },
   {
    "key": "name",
    "label": "اسم مجموعة الصرفيات",
    "type": "text",
    "w": 924
   },
   {
    "key": "taxable",
    "label": "خاضعة للضريبة",
    "type": "check",
    "w": 462
   }
  ],
  "rows": [
   {
    "code": "01",
    "name": "المرتب الشهري",
    "taxable": true
   },
   {
    "code": "02",
    "name": "المكافآت",
    "taxable": false
   },
   {
    "code": "03",
    "name": "الحوافز",
    "taxable": true
   },
   {
    "code": "04",
    "name": "بدل السفر",
    "taxable": false
   },
   {
    "code": "05",
    "name": "التسويات",
    "taxable": true
   }
  ]
 },
 {
  "slug": "bank-groups",
  "tab": "مجموعات الصرفيات بنوك",
  "add": "إضافة مجموعة",
  "search": "ابحث بكود أو اسم مجموعة الصرفيات...",
  "cols": [
   {
    "key": "code",
    "label": "كود المجموعة",
    "type": "key",
    "w": 338
   },
   {
    "key": "name",
    "label": "اسم مجموعة الصرفيات",
    "type": "text",
    "w": 1355
   }
  ],
  "rows": [
   {
    "code": "01",
    "name": "صرفيات البنك الأهلي المصري"
   },
   {
    "code": "02",
    "name": "صرفيات بنك مصر"
   },
   {
    "code": "03",
    "name": "صرفيات البنك التجاري الدولي"
   },
   {
    "code": "04",
    "name": "صرفيات بنك القاهرة"
   }
  ]
 },
 {
  "slug": "disbursement-types",
  "tab": "أنواع الصرفيات",
  "add": "إضافة صرفية",
  "search": "ابحث بكود أو بيان الصرفية...",
  "cols": [
   {
    "key": "code",
    "label": "كود الصرفية",
    "type": "key",
    "w": 242
   },
   {
    "key": "name",
    "label": "بيان الصرفية",
    "type": "text",
    "w": 484
   },
   {
    "key": "taxGroup",
    "label": "المجموعة الضريبية للصرفية",
    "type": "select",
    "w": 484,
    "options": [
     "التسويات",
     "الحوافز",
     "المرتب الشهري",
     "المكافآت",
     "بدل السفر"
    ]
   },
   {
    "key": "bankGroup",
    "label": "مجموعة الصرفية بنوك",
    "type": "select",
    "w": 484,
    "options": [
     "صرفيات البنك الأهلي المصري",
     "صرفيات البنك التجاري الدولي",
     "صرفيات بنك القاهرة",
     "صرفيات بنك مصر"
    ]
   }
  ],
  "rows": [
   {
    "code": "01",
    "name": "مرتب شهري",
    "taxGroup": "المرتب الشهري",
    "bankGroup": "صرفيات البنك الأهلي المصري"
   },
   {
    "code": "02",
    "name": "مكافأة",
    "taxGroup": "المكافآت",
    "bankGroup": "صرفيات بنك مصر"
   },
   {
    "code": "03",
    "name": "حافز",
    "taxGroup": "الحوافز",
    "bankGroup": "صرفيات البنك التجاري الدولي"
   },
   {
    "code": "04",
    "name": "بدل سفر",
    "taxGroup": "بدل السفر",
    "bankGroup": "صرفيات بنك القاهرة"
   },
   {
    "code": "05",
    "name": "تسوية",
    "taxGroup": "التسويات",
    "bankGroup": "صرفيات البنك الأهلي المصري"
   }
  ]
 },
 {
  "slug": "financial-constants",
  "tab": "الثوابت المالية للمرتبات",
  "add": "إضافة ثابت",
  "search": "ابحث بكود أو اسم الثابت...",
  "cols": [
   {
    "key": "code",
    "label": "كود الثابت",
    "type": "key",
    "w": 150
   },
   {
    "key": "name",
    "label": "اسم الثابت",
    "type": "text",
    "w": 301
   },
   {
    "key": "value",
    "label": "قيمة الثابت",
    "type": "text",
    "w": 188
   },
   {
    "key": "valueType",
    "label": "نوع الثابت",
    "type": "select",
    "w": 188,
    "options": [
     "قيمة",
     "نسبة"
    ]
   },
   {
    "key": "startDate",
    "label": "تاريخ بداية التطبيق",
    "type": "date",
    "w": 244
   },
   {
    "key": "endDate",
    "label": "تاريخ نهاية التطبيق",
    "type": "date",
    "w": 244
   },
   {
    "key": "notes",
    "label": "ملاحظات",
    "type": "text",
    "w": 376
   }
  ],
  "rows": [
   {
    "code": "01",
    "name": "بدل الإنارة",
    "value": "75",
    "valueType": "قيمة",
    "startDate": "01/07/2024",
    "endDate": "—",
    "notes": "يصرف لجميع الموظفين"
   },
   {
    "code": "02",
    "name": "الحافز الدوري",
    "value": "10%",
    "valueType": "نسبة",
    "startDate": "01/07/2024",
    "endDate": "30/06/2025",
    "notes": "يحسب على الأساسي"
   },
   {
    "code": "03",
    "name": "بدل الانتقال",
    "value": "120",
    "valueType": "قيمة",
    "startDate": "01/01/2025",
    "endDate": "غير محدد",
    "notes": "ملاحظات"
   },
   {
    "code": "04",
    "name": "الحافز الإضافي",
    "value": "5%",
    "valueType": "نسبة",
    "startDate": "01/07/2024",
    "endDate": "30/06/2026",
    "notes": "العام المالي 2025/2026"
   }
  ]
 },
 {
  "slug": "tickets",
 "idKey": "id",
  "tab": "تكلفة تذاكر المقابل النقدي",
  "add": "إضافة تكلفة تذكرة",
  "search": "ابحث باسم الهندسة أو الدرجة الوظيفية...",
  "cols": [
   {
    "key": "engineering",
    "label": "الهندسة",
    "type": "select",
    "w": 413,
    "options": [
     "هندسة أسوان",
     "هندسة إدفو",
     "هندسة الأقصر",
     "هندسة نجع حمادي"
    ]
   },
   {
    "key": "grade",
    "label": "الدرجة الوظيفية",
    "type": "select",
    "w": 330,
    "options": [
     "الدرجة الأولى",
     "الدرجة الثالثة",
     "الدرجة الثانية"
    ]
   },
   {
    "key": "fullTicket",
    "label": "قيمة التذكرة الكاملة",
    "type": "text",
    "w": 268
   },
   {
    "key": "halfTicket",
    "label": "قيمة نصف التذكرة",
    "type": "text",
    "w": 268
   },
   {
    "key": "notes",
    "label": "ملاحظات",
    "type": "text",
    "w": 413
   }
  ],
  "rows": [
   {
    "id": 1,
    "engineering": "هندسة أسوان",
    "grade": "الدرجة الأولى",
    "fullTicket": "120",
    "halfTicket": "60",
    "notes": "—"
   },
   {
    "id": 2,
    "engineering": "هندسة أسوان",
    "grade": "الدرجة الثانية",
    "fullTicket": "100",
    "halfTicket": "50",
    "notes": "—"
   },
   {
    "id": 3,
    "engineering": "هندسة إدفو",
    "grade": "الدرجة الأولى",
    "fullTicket": "110",
    "halfTicket": "55",
    "notes": "تشمل رسوم الحجز"
   },
   {
    "id": 4,
    "engineering": "هندسة الأقصر",
    "grade": "الدرجة الثانية",
    "fullTicket": "90",
    "halfTicket": "45",
    "notes": "—"
   },
   {
    "id": 5,
    "engineering": "هندسة نجع حمادي",
    "grade": "الدرجة الثالثة",
    "fullTicket": "85",
    "halfTicket": "42.5",
    "notes": "—"
   }
  ]
 },
 {
  "slug": "holidays",
  "tab": "العطلات الرسمية",
  "add": "إضافة عطلة",
  "search": "ابحث بكود أو بيان العطلة...",
  "cols": [
   {
    "key": "code",
    "label": "كود العطلة",
    "type": "key",
    "w": 193
   },
   {
    "key": "name",
    "label": "بيان العطلة الرسمية",
    "type": "text",
    "w": 484
   },
   {
    "key": "date",
    "label": "تاريخ العطلة",
    "type": "date",
    "w": 314
   },
   {
    "key": "days",
    "label": "عدد الأيام",
    "type": "text",
    "w": 217
   },
   {
    "key": "notes",
    "label": "ملاحظات",
    "type": "text",
    "w": 484
   }
  ],
  "rows": [
   {
    "code": "01",
    "name": "رأس السنة الميلادية",
    "date": "01/01/2026",
    "days": "1",
    "notes": "—"
   },
   {
    "code": "02",
    "name": "عيد الميلاد المجيد",
    "date": "07/01/2026",
    "days": "1",
    "notes": "—"
   },
   {
    "code": "03",
    "name": "عيد تحرير سيناء",
    "date": "25/04/2026",
    "days": "1",
    "notes": "ملاحظات"
   },
   {
    "code": "04",
    "name": "عيد العمال",
    "date": "01/05/2026",
    "days": "1",
    "notes": "—"
   },
   {
    "code": "05",
    "name": "عيد الأضحى المبارك",
    "date": "27/05/2026",
    "days": "4",
    "notes": "يتحدد بحسب رؤية الهلال"
   }
  ]
 }
];
