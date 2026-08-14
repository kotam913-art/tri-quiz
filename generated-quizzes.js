(() => {
  const section = document.querySelector("#generated-section");
  const grid = document.querySelector("#generated-grid");
  const error = document.querySelector("#generated-error");

  if (!section || !grid) return;

  const makeTag = (text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    return tag;
  };

  fetch("generated-quiz-data/index.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("manifest unavailable");
      return response.json();
    })
    .then((manifest) => {
      const quizzes = Array.isArray(manifest.quizzes) ? manifest.quizzes : [];
      if (quizzes.length === 0) return;

      quizzes.forEach((quiz, index) => {
        if (!quiz || !quiz.id || !quiz.title) return;

        const card = document.createElement("a");
        card.className = "card generated-card";
        card.href = `generated-quiz.html?id=${encodeURIComponent(quiz.id)}`;

        const number = document.createElement("span");
        number.className = "num";
        number.textContent = String(index + 5).padStart(2, "0");

        const title = document.createElement("h2");
        title.textContent = quiz.title;

        const summary = document.createElement("p");
        summary.textContent = quiz.summary || "自作プリントをもとにした固定類題です。";

        const tags = document.createElement("div");
        tags.className = "tags";
        [quiz.unit, quiz.level, quiz.estimated_minutes ? `${quiz.estimated_minutes}分` : null]
          .filter(Boolean)
          .forEach((value) => tags.append(makeTag(value)));

        const go = document.createElement("span");
        go.className = "go";
        go.textContent = "類題を始める →";

        card.append(number, title, summary, tags, go);
        grid.append(card);
      });

      if (grid.children.length > 0) section.hidden = false;
    })
    .catch(() => {
      if (error) error.hidden = false;
    });
})();
