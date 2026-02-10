/* Product Defaults */
const DEFAULTS = [
    { id: 1, name: "Farmers Tomato", hindi: "टमाटर", price: 40, unit: "kg", img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80" },
    { id: 2, name: "Red Onion", hindi: "प्याज", price: 30, unit: "kg", img: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80" },
    { id: 3, name: "Fresh Potato", hindi: "आलू", price: 20, unit: "kg", img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80" },
    { id: 4, name: "Spinach (Palak)", hindi: "पालक", price: 15, unit: "bunch", img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80" },
    { id: 5, name: "Cauliflower", hindi: "फूलगोभी", price: 40, unit: "pc", img: "https://images.unsplash.com/photo-1568584711075-3d021a7b3bab?auto=format&fit=crop&w=400&q=80" },
    { id: 6, name: "Fresh Coriander", hindi: "धनिया", price: 10, unit: "bunch", img: "https://media.istockphoto.com/id/1320857321/photo/fresh-coriander-leaves-in-bowl-on-wooden-background.jpg?b=1&s=612x612&w=0&k=20&c=6k_Jb9q6Xq7Xq7Xq7Xq7Xq7Xq7Xq7Xq7Xq7Xq7Xq7Xq7" },
    { id: 7, name: "Ginger", hindi: "अदरक", price: 80, unit: "kg", img: "https://images.unsplash.com/photo-1635843104689-537a778c6e32?auto=format&fit=crop&w=400&q=80" },
    { id: 8, name: "Lady Finger", hindi: "भिंडी", price: 60, unit: "kg", img: "https://images.unsplash.com/photo-1610344265330-9195d852a466?auto=format&fit=crop&w=400&q=80" },
    { id: 9, name: "Green Chilli", hindi: "हरी मिर्च", price: 20, unit: "250gm", img: "https://images.unsplash.com/photo-1588619454483-4c4897c99276?auto=format&fit=crop&w=400&q=80" },
    { id: 10, name: "Carrot", hindi: "गाजर", price: 50, unit: "kg", img: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80" },
    { id: 11, name: "Cucumber", hindi: "खीरा", price: 40, unit: "kg", img: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=400&q=80" },
    { id: 12, name: "Lemon", hindi: "नींबू", price: 5, unit: "pc", img: "https://images.unsplash.com/photo-1590759607925-563283a69b80?auto=format&fit=crop&w=400&q=80" }
];

// Shared Function to Generate Bill Text (Antigravity Format)
function generateOrderBillText(order) {
    let msg = `🧾 *DAILY FRESH INVOICE*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📅 *Date:* ${order.date}\n`;
    msg += `⏰ *Time:* ${order.time}\n`;
    msg += `👤 *Customer:* ${order.customer.name}\n`;
    msg += `📞 *Phone:* ${order.customer.phone}\n`;
    msg += `🏠 *Address:* ${order.customer.address}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📦 *ORDER DETAILS*\n\n`;

    order.items.forEach((item, index) => {
        msg += `${index + 1}. *${item.name}*\n`;
        msg += `   ${item.qty} ${item.unit} x ₹${item.price} = ₹${item.total}\n`;
    });

    msg += `\n━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *GRAND TOTAL: ₹${order.total}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🙏 *Thank you for shopping!*`;

    return msg;
}
