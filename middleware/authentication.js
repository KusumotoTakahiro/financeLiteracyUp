export default function(context) {
  //認証されていないユーザの場合，リダイレクト
  const isAuthenticated = context.store.getters["authentication/isAuthenticated"]
  if (!isAuthenticated) {
    context.redirect('/login');
  }
}