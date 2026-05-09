print("Project Started")

while True:

#heading
    print("==================")
    print("EMI CALCULATOR")
    print("==================")

#gathering inputs
    customer_name = input("Enter Customer Name: ")
    loan_amount = float(input("Enter the Loan Amount: "))
    interest_rate = float(input("Enter the Interest Rate(%): "))
    loan_duration = int(input("Enter the Loan Duration (in years): "))
    monthly_interest_rate = interest_rate / (12 * 100)
    loan_months = loan_duration * 12

    EMI = (loan_amount * monthly_interest_rate * (1 + monthly_interest_rate) ** loan_months) / ((1 + monthly_interest_rate) ** loan_months - 1)


    print("\n------ EMI DETAILS ------")
    print(f"Customer Name: {customer_name}")
    print(f"Monthly EMI: ₹{EMI:.2f}")

    again = input("\nDo you want to calculate EMI for another customer? (yes/no): ")

    while again.lower() == 'no':
        print("Thank you for using the EMI Calculator. Goodbye!")
        break