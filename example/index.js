System.import("app").then(({ app }) => {
  const root = document.querySelector("#root")
  ReactDOM.render(app, root)
})