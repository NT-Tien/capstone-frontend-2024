import React from 'react'

const styles = {
    header: {
        backgroundColor: 'black',
        color: 'white',
        padding: '10px',
        textAlign: 'center' as 'center',
        width: '100%',
    },
}

export default function Header() {
    return (
        <div style={styles.header}>
            <h1>Admin Header</h1>
        </div>
    )
}
