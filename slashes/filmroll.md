---
layout: page
title: Filmroll
permalink: /filmroll
---

Some list of movies I watched, I'll also put some good reviews here trust

<hr>
<div id="letterboxd-embed-wrapper-tc">Loading...</div>
<script>
  fetch('https://lb-embed-content.bokonon.dev/?username=Fafau06')
    .then(response => response.text())
    .then(data => {document.getElementById('letterboxd-embed-wrapper-tc').innerHTML = data;});
</script>
