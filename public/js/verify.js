document.getElementById('cpass').addEventListener('input', (e) => {
    const v1 = document.getElementById('pass').value;
    const v2 = document.getElementById('cpass').value;
    if (v1 !== v2) {
        document.getElementById('btn').classList.add('hide');
    } else {
        document.getElementById('btn').classList.toggle('hide')
    }
});