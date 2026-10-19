const EXPLOG_DATA = [
  {
    "id": "explog-01",
    "title": "整数の指数・指数法則",
    "sourcePages": [
      1
    ],
    "group": "指数",
    "seconds": 300,
    "tip": "積では足す、商では引く、累乗の累乗では掛ける。",
    "questions": [
      {
        "prompt": "5<sup>0</sup> の値は？",
        "type": "number",
        "answer": "1",
        "explanation": "0でない数の0乗は1。"
      },
      {
        "prompt": "4<sup>−2</sup> の値は？",
        "type": "number",
        "answer": "1/16",
        "explanation": "4⁻² = 1/4² = 1/16。"
      },
      {
        "prompt": "3<sup>4</sup> × 3<sup>−2</sup> = 3<sup>□</sup>",
        "type": "number",
        "answer": "2",
        "explanation": "同じ底の積では指数を足す。4 + (−2) = 2。"
      },
      {
        "prompt": "10<sup>−3</sup> ÷ 10<sup>2</sup> = 10<sup>□</sup>",
        "type": "number",
        "answer": "-5",
        "explanation": "同じ底の商では指数を引く。−3 − 2 = −5。"
      },
      {
        "prompt": "0.00074 = 7.4 × 10<sup>□</sup>",
        "type": "number",
        "answer": "-4",
        "explanation": "小数点を4桁動かすので、指数は−4。"
      },
      {
        "prompt": "(2 × 3<sup>4</sup>)<sup>−2</sup> = 2<sup>−2</sup> × 3<sup>□</sup>",
        "type": "number",
        "answer": "-8",
        "explanation": "累乗の累乗では指数を掛ける。4 × (−2) = −8。"
      }
    ]
  },
  {
    "id": "explog-02",
    "title": "累乗根と分数の指数",
    "sourcePages": [
      2
    ],
    "group": "指数",
    "seconds": 300,
    "tip": "a の m/n 乗は、a の m 乗の n 乗根。",
    "questions": [
      {
        "prompt": "⁴√2 = 2<sup>□</sup>。指数を答えよう。",
        "type": "number",
        "answer": "1/4",
        "explanation": "n乗根は1/n乗。"
      },
      {
        "prompt": "³√(3²) = 3<sup>□</sup>",
        "type": "number",
        "answer": "2/3",
        "explanation": "3²の3乗根なので、指数は2/3。"
      },
      {
        "prompt": "1 / ⁴√5 = 5<sup>□</sup>",
        "type": "number",
        "answer": "-1/4",
        "explanation": "逆数にすると指数の符号が逆になる。"
      },
      {
        "prompt": "⁵√6 = □<sup>1/5</sup>",
        "type": "number",
        "answer": "6",
        "explanation": "底は根号の中の6。"
      }
    ]
  },
  {
    "id": "explog-03",
    "title": "分数の指数の計算",
    "sourcePages": [
      2
    ],
    "group": "指数",
    "seconds": 300,
    "tip": "まず同じ底の指数をまとめよう。",
    "questions": [
      {
        "prompt": "8<sup>1/2</sup> × 8<sup>1/3</sup> ÷ 8<sup>1/6</sup>",
        "type": "number",
        "answer": "4",
        "explanation": "指数は1/2 + 1/3 − 1/6 = 2/3。8^(2/3) = 4。"
      },
      {
        "prompt": "√2 × ³√2 × ⁶√2",
        "type": "number",
        "answer": "2",
        "explanation": "指数は1/2 + 1/3 + 1/6 = 1。"
      },
      {
        "prompt": "3<sup>1/2</sup> ÷ 3<sup>1/6</sup> × 3<sup>−1/3</sup>",
        "type": "number",
        "answer": "1",
        "explanation": "指数は1/2 − 1/6 − 1/3 = 0。"
      },
      {
        "prompt": "⁴√5 × ⁸√(5³) ÷ √5 = 5<sup>□</sup>",
        "type": "number",
        "answer": "1/8",
        "explanation": "1/4 + 3/8 − 1/2 = 1/8。"
      }
    ]
  },
  {
    "id": "explog-04",
    "title": "指数関数のグラフ",
    "sourcePages": [
      3
    ],
    "group": "指数",
    "seconds": 300,
    "tip": "底が1より大きいと増加、0と1の間なら減少。",
    "questions": [
      {
        "prompt": "y = 3<sup>x</sup> で、x = 0 のときの y",
        "type": "number",
        "answer": "1",
        "explanation": "3⁰ = 1。"
      },
      {
        "prompt": "y = 3<sup>x</sup> で、x = −1 のときの y",
        "type": "number",
        "answer": "1/3",
        "explanation": "3⁻¹ = 1/3。"
      },
      {
        "prompt": "図の青い右上がりの曲線はどちら？",
        "type": "choice",
        "options": [
          "y = 3<sup>x</sup>",
          "y = (1/3)<sup>x</sup>"
        ],
        "answer": "0",
        "explanation": "底が1より大きい指数関数は右上がり。"
      },
      {
        "prompt": "y = 3<sup>x</sup> と y = (1/3)<sup>x</sup> は何について対称？",
        "type": "choice",
        "options": [
          "x軸",
          "y軸",
          "原点",
          "直線 y = x"
        ],
        "answer": "1",
        "explanation": "(1/3)^x = 3^(−x) なので、y軸について対称。"
      },
      {
        "prompt": "y = 3<sup>x</sup> の値域は？",
        "type": "choice",
        "options": [
          "y > 0",
          "y ≥ 0",
          "すべての実数",
          "y > 1"
        ],
        "answer": "0",
        "explanation": "常に正。0にはならない。"
      }
    ]
  },
  {
    "id": "explog-05",
    "title": "指数・累乗根の大小比較",
    "sourcePages": [
      16
    ],
    "group": "指数",
    "seconds": 300,
    "tip": "底をそろえ、底が1より大きいか小さいかを確認。",
    "questions": [
      {
        "prompt": "√3、³√9、⁴√27 を小さい順に。",
        "type": "choice",
        "options": [
          "√3 < ³√9 < ⁴√27",
          "⁴√27 < ³√9 < √3",
          "³√9 < √3 < ⁴√27"
        ],
        "answer": "0",
        "explanation": "3^(1/2)、3^(2/3)、3^(3/4)。底3では指数の順。"
      },
      {
        "prompt": "(1/5)<sup>4/3</sup>、(1/5)<sup>3/4</sup>、(1/5)<sup>5/6</sup> を小さい順に。",
        "type": "choice",
        "options": [
          "(1/5)^(3/4) < (1/5)^(5/6) < (1/5)^(4/3)",
          "(1/5)^(4/3) < (1/5)^(5/6) < (1/5)^(3/4)",
          "(1/5)^(5/6) < (1/5)^(4/3) < (1/5)^(3/4)"
        ],
        "answer": "1",
        "explanation": "底が1未満なので指数の大きい方が小さい。"
      },
      {
        "prompt": "2<sup>−1</sup> □ 2<sup>1/3</sup>",
        "type": "choice",
        "options": [
          "<",
          "=",
          ">"
        ],
        "answer": "0",
        "explanation": "底2は1より大きく、−1 < 1/3。"
      },
      {
        "prompt": "(1/3)<sup>−1</sup> □ (1/3)<sup>1/3</sup>",
        "type": "choice",
        "options": [
          "<",
          "=",
          ">"
        ],
        "answer": "2",
        "explanation": "底が1未満なので大小関係が逆になる。"
      }
    ]
  },
  {
    "id": "explog-06",
    "title": "指数方程式",
    "sourcePages": [
      17
    ],
    "group": "指数",
    "seconds": 300,
    "tip": "底をそろえて指数を比較しよう。",
    "questions": [
      {
        "prompt": "4<sup>x</sup> = 8 を解け。x = □",
        "type": "number",
        "answer": "3/2",
        "explanation": "2^(2x) = 2³ より2x = 3。"
      },
      {
        "prompt": "9<sup>x</sup> = 1/27 を解け。x = □",
        "type": "number",
        "answer": "-3/2",
        "explanation": "3^(2x) = 3⁻³ より2x = −3。"
      },
      {
        "prompt": "4<sup>2x+1</sup> = 1/64 を解け。x = □",
        "type": "number",
        "answer": "-2",
        "explanation": "2^(4x+2) = 2⁻⁶ より4x + 2 = −6。"
      },
      {
        "prompt": "8<sup>x</sup> = 4 を解け。x = □",
        "type": "number",
        "answer": "2/3",
        "explanation": "2^(3x) = 2² より3x = 2。"
      }
    ]
  },
  {
    "id": "explog-07",
    "title": "指数不等式",
    "sourcePages": [
      17
    ],
    "group": "指数",
    "seconds": 300,
    "tip": "底が1未満のとき、不等号の向きに注意。",
    "questions": [
      {
        "prompt": "8<sup>x</sup> > 16 の解は？",
        "type": "choice",
        "options": [
          "x > 4/3",
          "x < 4/3",
          "x > 3/4",
          "x < 3/4"
        ],
        "answer": "0",
        "explanation": "2^(3x) > 2⁴ より3x > 4。"
      },
      {
        "prompt": "4<sup>x+1</sup> ≥ 8<sup>x−3</sup> の解は？",
        "type": "choice",
        "options": [
          "x ≥ 11",
          "x ≤ 11",
          "x ≤ 7",
          "x ≥ 7"
        ],
        "answer": "1",
        "explanation": "2x + 2 ≥ 3x − 9 よりx ≤ 11。"
      },
      {
        "prompt": "(1/27)<sup>x</sup> < 1/9 の解は？",
        "type": "choice",
        "options": [
          "x < 2/3",
          "x > 2/3",
          "x > 3/2",
          "x < 3/2"
        ],
        "answer": "1",
        "explanation": "(1/3)^(3x) < (1/3)² より3x > 2。"
      },
      {
        "prompt": "(1/4)<sup>x</sup> > (1/2)<sup>x+2</sup> の解は？",
        "type": "choice",
        "options": [
          "x > 2",
          "x ≥ 2",
          "x < 2",
          "x ≤ 2"
        ],
        "answer": "2",
        "explanation": "底1/2では指数の大小が逆。2x < x + 2。"
      }
    ]
  },
  {
    "id": "explog-08",
    "title": "対数の意味と値",
    "sourcePages": [
      4
    ],
    "group": "対数",
    "seconds": 300,
    "tip": "logₐ M = p は aᵖ = M と同じ意味。",
    "questions": [
      {
        "prompt": "log<sub>3</sub> 9 の値",
        "type": "number",
        "answer": "2",
        "explanation": "3² = 9。"
      },
      {
        "prompt": "log<sub>2</sub> 16 の値",
        "type": "number",
        "answer": "4",
        "explanation": "2⁴ = 16。"
      },
      {
        "prompt": "log<sub>4</sub> 8 の値",
        "type": "number",
        "answer": "3/2",
        "explanation": "4^(3/2) = 8。"
      },
      {
        "prompt": "log<sub>1/2</sub> 32 の値",
        "type": "number",
        "answer": "-5",
        "explanation": "(1/2)⁻⁵ = 32。"
      },
      {
        "prompt": "log<sub>9</sub> √3 の値",
        "type": "number",
        "answer": "1/4",
        "explanation": "9^(1/4) = (3²)^(1/4) = √3。"
      }
    ]
  },
  {
    "id": "explog-09",
    "title": "対数の性質",
    "sourcePages": [
      5
    ],
    "group": "対数",
    "seconds": 300,
    "tip": "積→和、商→差、累乗→係数。",
    "questions": [
      {
        "prompt": "log<sub>2</sub> (3 × 5) = log<sub>2</sub> 3 + log<sub>2</sub> □",
        "type": "number",
        "answer": "5",
        "explanation": "積は対数の和になる。"
      },
      {
        "prompt": "log<sub>3</sub> (5/7) = log<sub>3</sub> 5 − log<sub>3</sub> □",
        "type": "number",
        "answer": "7",
        "explanation": "商は対数の差になる。"
      },
      {
        "prompt": "log<sub>2</sub> 5³ = □ log<sub>2</sub> 5",
        "type": "number",
        "answer": "3",
        "explanation": "真数の指数を前へ出す。"
      },
      {
        "prompt": "log<sub>3</sub> 15 = 1 + log<sub>3</sub> □",
        "type": "number",
        "answer": "5",
        "explanation": "15 = 3 × 5。log₃3 = 1。"
      },
      {
        "prompt": "log<sub>5</sub> (1/4) = −2 log<sub>5</sub> □",
        "type": "number",
        "answer": "2",
        "explanation": "1/4 = 2⁻²。"
      },
      {
        "prompt": "log<sub>7</sub> √3 = □ log<sub>7</sub> 3",
        "type": "number",
        "answer": "1/2",
        "explanation": "√3 = 3^(1/2)。"
      }
    ]
  },
  {
    "id": "explog-10",
    "title": "対数をまとめて計算",
    "sourcePages": [
      6
    ],
    "group": "対数",
    "seconds": 300,
    "tip": "係数を真数の指数へ戻して、1つの対数にまとめる。",
    "questions": [
      {
        "prompt": "log<sub>2</sub> 2 + log<sub>2</sub> 8",
        "type": "number",
        "answer": "4",
        "explanation": "log₂(2 × 8) = log₂16 = 4。"
      },
      {
        "prompt": "log<sub>3</sub> 63 − log<sub>3</sub> 21",
        "type": "number",
        "answer": "1",
        "explanation": "log₃(63/21) = log₃3 = 1。"
      },
      {
        "prompt": "log<sub>3</sub> √12 − log<sub>3</sub> 2",
        "type": "number",
        "answer": "1/2",
        "explanation": "log₃(√12/2) = log₃√3 = 1/2。"
      },
      {
        "prompt": "log<sub>2</sub> (2/5) + log<sub>2</sub> 10 − log<sub>2</sub> 8",
        "type": "number",
        "answer": "-1",
        "explanation": "log₂((2/5) × 10 / 8) = log₂(1/2) = −1。"
      },
      {
        "prompt": "3 log<sub>2</sub> 2 + (1/2) log<sub>2</sub> 3 − log<sub>2</sub> (4√6)",
        "type": "number",
        "answer": "1/2",
        "explanation": "log₂(8√3/(4√6)) = log₂√2 = 1/2。"
      }
    ]
  },
  {
    "id": "explog-11",
    "title": "底の変換公式",
    "sourcePages": [
      7
    ],
    "group": "対数",
    "seconds": 300,
    "tip": "logₐ b = log꜀ b / log꜀ a。分母は元の底。",
    "questions": [
      {
        "prompt": "log<sub>9</sub> 27",
        "type": "number",
        "answer": "3/2",
        "explanation": "log₃27 / log₃9 = 3/2。"
      },
      {
        "prompt": "log<sub>8</sub> √2",
        "type": "number",
        "answer": "1/6",
        "explanation": "log₂√2 / log₂8 = (1/2)/3。"
      },
      {
        "prompt": "log<sub>16</sub> 64",
        "type": "number",
        "answer": "3/2",
        "explanation": "log₂64 / log₂16 = 6/4。"
      },
      {
        "prompt": "log<sub>2</sub> 3 × log<sub>3</sub> 4",
        "type": "number",
        "answer": "2",
        "explanation": "底を2にそろえるとlog₂4 = 2。"
      },
      {
        "prompt": "log<sub>25</sub> 75 − log<sub>25</sub> 3",
        "type": "number",
        "answer": "1",
        "explanation": "log₂₅(75/3) = log₂₅25 = 1。"
      }
    ]
  },
  {
    "id": "explog-12",
    "title": "対数の条件とグラフ",
    "sourcePages": [
      8,
      9
    ],
    "group": "対数",
    "seconds": 300,
    "tip": "底と真数の条件を最初に確認。",
    "questions": [
      {
        "prompt": "logₐ x が定義される条件は？",
        "type": "choice",
        "options": [
          "a > 0、a ≠ 1、x > 0",
          "a > 0、x ≥ 0",
          "a ≠ 1、xは任意",
          "a > 1、x > 0"
        ],
        "answer": "0",
        "explanation": "底は正で1以外、真数は正。"
      },
      {
        "prompt": "y = log<sub>2</sub> x で x = 1 のときの y",
        "type": "number",
        "answer": "0",
        "explanation": "2⁰ = 1 よりlog₂1 = 0。"
      },
      {
        "prompt": "y = log<sub>2</sub> x で x = 1/2 のときの y",
        "type": "number",
        "answer": "-1",
        "explanation": "2⁻¹ = 1/2。"
      },
      {
        "prompt": "図の右下がりの対数曲線は？",
        "type": "choice",
        "options": [
          "y = log₂ x",
          "y = log₍₁/₂₎ x"
        ],
        "answer": "1",
        "explanation": "底が0と1の間なので減少する。"
      },
      {
        "prompt": "y = 2<sup>x</sup> と y = log<sub>2</sub> x は何について対称？",
        "type": "choice",
        "options": [
          "x軸",
          "y軸",
          "原点",
          "直線 y = x"
        ],
        "answer": "3",
        "explanation": "互いに逆関数なので直線y = xについて対称。"
      }
    ]
  },
  {
    "id": "explog-13",
    "title": "対数の大小比較",
    "sourcePages": [
      9,
      10
    ],
    "group": "対数",
    "seconds": 300,
    "tip": "係数があるときは真数の指数へ。",
    "questions": [
      {
        "prompt": "log<sub>3</sub> 2 □ log<sub>3</sub> 4",
        "type": "choice",
        "options": [
          "<",
          "=",
          ">"
        ],
        "answer": "0",
        "explanation": "底が1より大きいので真数の順。"
      },
      {
        "prompt": "log<sub>1/3</sub> (1/5) □ log<sub>1/3</sub> 3",
        "type": "choice",
        "options": [
          "<",
          "=",
          ">"
        ],
        "answer": "2",
        "explanation": "底が1未満なので真数と逆の順。"
      },
      {
        "prompt": "3 log<sub>3</sub> 3 □ 2 log<sub>3</sub> 5",
        "type": "choice",
        "options": [
          "<",
          "=",
          ">"
        ],
        "answer": "2",
        "explanation": "log₃27 とlog₃25を比べる。27 > 25。"
      },
      {
        "prompt": "(1/2) log<sub>1/2</sub> 8 □ log<sub>1/2</sub> 3",
        "type": "choice",
        "options": [
          "<",
          "=",
          ">"
        ],
        "answer": "2",
        "explanation": "左は−3/2。√8 < 3、底が1未満なので左が大きい。"
      },
      {
        "prompt": "log₍₁/₃₎ 3、log₍₁/₃₎ (1/5)、log₍₁/₃₎ 0.1 を小さい順に。",
        "type": "choice",
        "options": [
          "log₍₁/₃₎ 3 < log₍₁/₃₎ (1/5) < log₍₁/₃₎ 0.1",
          "log₍₁/₃₎ 0.1 < log₍₁/₃₎ (1/5) < log₍₁/₃₎ 3",
          "log₍₁/₃₎ (1/5) < log₍₁/₃₎ 3 < log₍₁/₃₎ 0.1"
        ],
        "answer": "0",
        "explanation": "真数は0.1 < 1/5 < 3。底が1未満なので逆順。"
      }
    ]
  },
  {
    "id": "explog-14",
    "title": "対数方程式・基本の不等式",
    "sourcePages": [
      11
    ],
    "group": "対数",
    "seconds": 300,
    "tip": "真数条件と、指数から求めた条件を両方満たす解を答える。",
    "questions": [
      {
        "prompt": "log<sub>2</sub> x = 4。x = □",
        "type": "number",
        "answer": "16",
        "explanation": "x > 0。x = 2⁴ = 16。"
      },
      {
        "prompt": "log<sub>1/2</sub> x = 2。x = □",
        "type": "number",
        "answer": "1/4",
        "explanation": "x = (1/2)² = 1/4。"
      },
      {
        "prompt": "log<sub>2</sub> x ≥ 4 の解は？",
        "type": "choice",
        "options": [
          "x ≥ 16",
          "0 < x ≤ 16",
          "x ≤ 16",
          "x ≥ 4"
        ],
        "answer": "0",
        "explanation": "真数条件x > 0。底2なのでx ≥ 16。"
      },
      {
        "prompt": "log<sub>1/2</sub> x > 2 の解は？",
        "type": "choice",
        "options": [
          "x < 1/4",
          "0 < x < 1/4",
          "x > 1/4",
          "0 < x ≤ 1/4"
        ],
        "answer": "1",
        "explanation": "真数条件x > 0。底が1未満なのでx < 1/4。"
      }
    ]
  },
  {
    "id": "explog-15",
    "title": "対数の和を含む方程式",
    "sourcePages": [
      12
    ],
    "group": "対数",
    "seconds": 300,
    "tip": "二次方程式の解を出した後、真数条件に戻る。",
    "questions": [
      {
        "prompt": "log<sub>3</sub> x + log<sub>3</sub> (x − 8) = 2。真数条件は？",
        "type": "choice",
        "options": [
          "x > 0",
          "x > 8",
          "x ≥ 8",
          "x < 0 または x > 8"
        ],
        "answer": "1",
        "explanation": "x > 0 かつx − 8 > 0よりx > 8。"
      },
      {
        "prompt": "同じ方程式 log<sub>3</sub> x + log<sub>3</sub> (x − 8) = 2 の解。x = □",
        "type": "number",
        "answer": "9",
        "explanation": "x(x − 8) = 9 → (x − 9)(x + 1) = 0。x > 8より9。"
      },
      {
        "prompt": "log<sub>2</sub> (x + 1) + log<sub>2</sub> (x + 2) = log<sub>2</sub> 12。x = □",
        "type": "number",
        "answer": "2",
        "explanation": "真数条件x > −1。(x + 1)(x + 2) = 12 → (x + 5)(x − 2) = 0。2のみ。"
      }
    ]
  },
  {
    "id": "explog-16",
    "title": "真数条件を伴う対数不等式",
    "sourcePages": [
      13
    ],
    "group": "対数",
    "seconds": 300,
    "tip": "不等号を変えた後も、真数条件を忘れない。",
    "questions": [
      {
        "prompt": "log<sub>2</sub> (x − 3) ≤ 1 の解は？",
        "type": "choice",
        "options": [
          "x ≤ 5",
          "3 < x ≤ 5",
          "3 ≤ x ≤ 5",
          "x > 3"
        ],
        "answer": "1",
        "explanation": "x > 3、x − 3 ≤ 2。共通範囲は3 < x ≤ 5。"
      },
      {
        "prompt": "log<sub>3</sub> (x − 1) > 3 の解は？",
        "type": "choice",
        "options": [
          "x > 28",
          "x > 27",
          "1 < x < 28",
          "x ≥ 28"
        ],
        "answer": "0",
        "explanation": "x > 1、x − 1 > 27よりx > 28。"
      },
      {
        "prompt": "log<sub>1/2</sub> (2x − 5) ≥ log<sub>1/2</sub> (x + 3) の解は？",
        "type": "choice",
        "options": [
          "x ≤ 8",
          "5/2 ≤ x ≤ 8",
          "5/2 < x ≤ 8",
          "x ≥ 8"
        ],
        "answer": "2",
        "explanation": "真数条件x > 5/2。底が1未満なので2x − 5 ≤ x + 3、つまりx ≤ 8。"
      }
    ]
  },
  {
    "id": "explog-17",
    "title": "常用対数と桁数の考え方",
    "sourcePages": [
      14
    ],
    "group": "常用対数",
    "seconds": 300,
    "tip": "10ⁿ ≤ N < 10ⁿ⁺¹ のとき、整数Nはn + 1桁。",
    "questions": [
      {
        "prompt": "10<sup>2</sup> は何桁？",
        "type": "number",
        "answer": "3",
        "explanation": "10² = 100なので3桁。"
      },
      {
        "prompt": "10<sup>3</sup> は何桁？",
        "type": "number",
        "answer": "4",
        "explanation": "10³ = 1000なので4桁。"
      },
      {
        "prompt": "10<sup>19</sup> は何桁？",
        "type": "number",
        "answer": "20",
        "explanation": "10ⁿは1の後ろに0がn個。n + 1桁。"
      },
      {
        "prompt": "正の整数 N が 10<sup>8</sup> ≤ N < 10<sup>9</sup> を満たす。N は何桁？",
        "type": "number",
        "answer": "9",
        "explanation": "10⁸以上10⁹未満の整数は9桁。"
      }
    ]
  },
  {
    "id": "explog-18",
    "title": "常用対数で累乗の桁数を求める",
    "sourcePages": [
      15
    ],
    "group": "常用対数",
    "seconds": 300,
    "tip": "常用対数の整数部分に1を足す。",
    "questions": [
      {
        "prompt": "log₁₀2 = 0.3010 とする。2<sup>20</sup> は何桁？",
        "type": "number",
        "answer": "7",
        "explanation": "log₁₀(2²⁰) = 20 × 0.3010 = 6.020。6 + 1 = 7桁。"
      },
      {
        "prompt": "log₁₀3 = 0.4771 とする。3<sup>20</sup> は何桁？",
        "type": "number",
        "answer": "10",
        "explanation": "20 × 0.4771 = 9.542。9 + 1 = 10桁。"
      },
      {
        "prompt": "log₁₀2 = 0.3010 とする。2<sup>30</sup> は何桁？",
        "type": "number",
        "answer": "10",
        "explanation": "30 × 0.3010 = 9.030。9 + 1 = 10桁。"
      }
    ]
  }
];
if(typeof module!=="undefined") module.exports=EXPLOG_DATA;
