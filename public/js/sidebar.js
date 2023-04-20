const sidebar = document.getElementById("sidebar");
const sidebarCollapse = document.getElementById("sidebarCollapse");

sidebarCollapse.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});
