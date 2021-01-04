export default function users(db) {
  const test1 = (req, res) => {
    console.log('about to render login ejs');
    // this doesn't work:
    return res.render('login');
  };
  return { test1 };
}
