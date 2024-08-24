function handleProjectClick(event, element) {
    // Prevent the default action of the link
    event.preventDefault();

    document.querySelectorAll('.custom-list-item').forEach(item => {
        item.classList.remove('active');
    });

    element.classList.add('active');

    // Get the target URL and info from data attributes
    const targetSrc = element.getAttribute('data-target');
    const info = element.getAttribute('data-info');
    
    // Update the iframe and project info
    document.getElementById('project-iframe').setAttribute('src', targetSrc);
    document.getElementById('project-title').textContent = element.textContent;
    document.getElementById('project-description').textContent = info;
    
    // Optionally, you can programmatically trigger the collapse if needed
    const collapseElement = document.getElementById('perryscopeDesc');
    const bsCollapse = new bootstrap.Collapse(collapseElement, {
        toggle: true
    });
}
