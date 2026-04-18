const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const cols = 15;
const seatData = [];
let idCounter = 1;

rows.forEach((row) => {
    for (let col = 1; col <= cols; col++) {
        let seatType = "single";
        let price = 75000;

        // Phân loại 5 hàng VIP (F, G, H, I, J)
        if (["F", "G", "H", "I", "J"].includes(row)) {
            seatType = "vip";
            price = 95000; // Giá giả định cho ghế VIP
        }
        // Phân loại 2 hàng ghế đôi (K, L)
        else if (["K", "L"].includes(row)) {
            seatType = "couple";
            price = 150000; // Giá giả định cho 1 cặp ghế đôi
        }

        seatData.push({
            id: idCounter.toString(),
            row: row,
            number: col,
            type: seatType,
            price: price,
            isAvailable: true,
        });

        idCounter++;
    }
});

export const SEATS_DATA = seatData;
