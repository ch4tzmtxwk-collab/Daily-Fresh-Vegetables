
// Search/Filter Function
function filterItems() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const cards = document.querySelectorAll('.product-card');
    let hasResults = false;

    cards.forEach(card => {
        const name = card.querySelector('.item-name').innerText.toLowerCase();

        if (name.includes(query)) {
            card.style.display = 'flex';
            // Reset animation to ensure it's visible and nice
            card.style.animation = 'none';
            card.offsetHeight; /* trigger reflow */
            card.style.animation = 'fadeInUp 0.3s ease forwards';
            hasResults = true;
        } else {
            card.style.display = 'none';
        }
    });

    // Handle no results
    const grid = document.getElementById('productGrid');
    let noResultsMsg = document.getElementById('noResultsMsg');

    if (!hasResults) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noResultsMsg';
            noResultsMsg.style.gridColumn = '1/-1';
            noResultsMsg.style.textAlign = 'center';
            noResultsMsg.style.padding = '40px';
            noResultsMsg.style.color = 'var(--text-light)';
            noResultsMsg.innerHTML = '<p>🥕 No products found. Try a different name!</p>';
            grid.appendChild(noResultsMsg);
        }
        noResultsMsg.style.display = 'block';
    } else {
        if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }
}
