(() => {
  const id = new URLSearchParams(location.search).get("id");
  const loading = document.querySelector("#loading");
  const error = document.querySelector("#error");
  const quiz = document.querySelector("#quiz");

  const fail = () => {
    loading.hidden = true;
    error.hidden = false;
  };

  if (!id || !/^[a-z0-9][a-z0-9-]{2,79}$/.test(id)) {
    fail();
    return;
  }

  fetch(`generated-quiz-data/${encodeURIComponent(id)}.json`, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("quiz unavailable");
      return response.json();
    })
    .then((data) => {
      if (!data || data.id !== id || !data.title || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("invalid quiz");
      }

      document.title = `${data.title}｜Math Link`;
      document.querySelector("#quiz-kicker").textContent = data.source_label || "プリント類題";
      document.querySelector("#quiz-title").textContent = data.title;
      document.querySelector("#quiz-summary").textContent = data.summary || "自作プリントをもとにした固定類題です。";

      const tags = document.querySelector("#quiz-tags");
      [data.subject, data.unit, data.level, data.estimated_minutes ? `${data.estimated_minutes}分` : null]
        .filter(Boolean)
        .forEach((value) => {
          const tag = document.createElement("span");
          tag.textContent = value;
          tags.append(tag);
        });

      const pdfLink = document.querySelector("#pdf-link");
      if (data.pdf_url) {
        pdfLink.href = data.pdf_url;
        pdfLink.hidden = false;
      }

      const list = document.querySelector("#question-list");
      const template = document.querySelector("#question-template");

      data.questions.forEach((question, index) => {
        const fragment = template.content.cloneNode(true);
        fragment.querySelector(".question-number").textContent = `問題 ${question.number || index + 1}`;
        fragment.querySelector(".source-label").textContent = question.source_label || data.source_label || "オリジナル類題";
        fragment.querySelector(".question-prompt").textContent = question.prompt;
        fragment.querySelector(".answer").textContent = question.answer;
        fragment.querySelector(".explanation").textContent = question.explanation;

        const sourceLink = fragment.querySelector(".source-link");
        if (question.source_url) {
          sourceLink.href = question.source_url;
          sourceLink.hidden = false;
        }
        list.append(fragment);
      });

      loading.hidden = true;
      quiz.hidden = false;
    })
    .catch(fail);
})();
