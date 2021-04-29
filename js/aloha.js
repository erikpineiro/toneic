

const user = localStorage.getItem("user");
const token = localStorage.getItem("token");
const data = user && token ? `/u=${user}&t=${token}` : "";
window.location.href = `toneic.php${data}`;

