const all = document.querySelectorAll(".sh");
all.forEach((elem) =>
    elem.addEventListener("click", (e) => {
        const type = e.target.parentNode.parentNode
            .querySelector("input")
            .getAttribute("type");
        if (type === "password") {
            e.target.parentNode.parentNode
                .querySelector("input")
                .setAttribute("type", "text");
        } else {
            e.target.parentNode.parentNode
                .querySelector("input")
                .setAttribute("type", "password");
        }
    })
);
document.querySelectorAll('.del').forEach((e) => {
    e.addEventListener('click', (event) => {
        const alert = confirm('Are you sure you want to delete ?');
        const delid = event.target.parentNode.getAttribute('id');
        if (alert === true) {
            event.target.parentNode.parentNode.style.display = "none";
            fetch(`http://192.168.0.8/delete?_method=DELETE&id=${delid}`, {
                "method": "POST"
            }).then(() => {
                window.location.reload();
            })
        }
    });
});