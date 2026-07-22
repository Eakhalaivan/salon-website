#!/bin/bash
entities=("Service:services" "Staff:staff" "Customer:customers" "Branch:branches" "SubscriptionPlan:subscription_plans" "Coupon:coupons" "GiftCard:gift_cards")
DIR="backend/src/main/java/com/luxesuite/api/model"

for entry in "${entities[@]}"; do
    ENTITY="${entry%%:*}"
    TABLE="${entry##*:}"
    FILE="$DIR/$ENTITY.java"
    
    if [ ! -f "$FILE" ]; then
        echo "File $FILE not found!"
        continue
    fi

    # Add imports
    if ! grep -q "org.hibernate.annotations.SQLDelete" "$FILE"; then
        sed -i '' -e 's/import jakarta.persistence.\*;/import jakarta.persistence.\*;\nimport org.hibernate.annotations.SQLDelete;\nimport org.hibernate.annotations.SQLRestriction;/g' "$FILE"
    fi
    
    # Add annotations
    if ! grep -q "@SQLDelete" "$FILE"; then
        sed -i '' -e "s/@Table(name = \"$TABLE\")/@Table(name = \"$TABLE\")\n@SQLDelete(sql = \"UPDATE $TABLE SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?\")\n@SQLRestriction(\"deleted_at IS NULL\")/g" "$FILE"
    fi

    # Add deletedAt field before @PrePersist
    if ! grep -q "deletedAt" "$FILE"; then
        sed -i '' -e 's/@PrePersist/    @Column(name = "deleted_at")\n    private LocalDateTime deletedAt;\n\n    @PrePersist/g' "$FILE"
        
        # If @PrePersist doesn't exist, we might have a problem. Let's check:
        if ! grep -q "deletedAt" "$FILE"; then
            # fallback: just put it before the closing brace
            sed -i '' -e 's/^}$/    @Column(name = "deleted_at")\n    private LocalDateTime deletedAt;\n}/g' "$FILE"
        fi
    fi
done
